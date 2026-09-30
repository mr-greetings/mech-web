import json
import re
import sys
from pathlib import Path

from pypdf import PdfReader

CODE_RE = re.compile(r"U23[A-Z0-9]{5,6}")
SEMESTERS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"]
CATEGORY_RE = re.compile(r"(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(Gender\s+Sensitization|HS|BS|ES|PCS|PC|PE|OE|EEC|MC|MT|IKS|UHV|EVS|SDG|CIVIL|CSE|ECE|EEE|MECH)\b", re.I)
SLOT_RE = re.compile(
    r"(Professional Elective\s*[-–]?\s*(?:I|II|III|IV|V|VI)|"
    r"Open Elective\s*[-–]?\s*(?:I|II|III)|Mandatory Course\s*(?:I|II))"
    r"\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(PE|OE|MT)\b",
    re.I,
)


def clean_text(value):
    return " ".join(value.replace("\u00a0", " ").split()).strip(" -–")


def table_courses(text, default_category=None):
    matches = list(CODE_RE.finditer(text))
    courses = []
    for index, code_match in enumerate(matches):
        end = matches[index + 1].start() if index + 1 < len(matches) else len(text)
        chunk = text[code_match.end():end]
        row = CATEGORY_RE.search(chunk)
        offering_department = None
        if row:
            title = clean_text(chunk[:row.start()])
            lecture, tutorial, practical, credits = map(int, row.groups()[:4])
            category = clean_text(row.group(5)).upper()
            if category in {"CIVIL", "CSE", "ECE", "EEE", "MECH"}:
                offering_department = category
                category = default_category
        else:
            title = clean_text(chunk)
            lecture = tutorial = practical = credits = None
            category = default_category
        title = re.sub(r"^(?:Theory|Practical|Mandatory|Employability Enhancement Course)\s+", "", title, flags=re.I)
        if title:
            courses.append({
                "courseCode": code_match.group(0),
                "courseName": title,
                "category": category,
                "lectureHours": lecture,
                "tutorialHours": tutorial,
                "practicalHours": practical,
                "credits": credits,
                "offeringDepartment": offering_department,
            })
    return courses


def parse_semesters(texts):
    semesters = []
    for page_index in range(4, 8):
        text = texts[page_index]
        headers = list(re.finditer(r"SEMESTER\s+(VIII|VII|VI|V|IV|III|II|I)\b", text, re.I))
        for index, header in enumerate(headers):
            roman = header.group(1).upper()
            number = SEMESTERS.index(roman) + 1
            end = headers[index + 1].start() if index + 1 < len(headers) else len(text)
            section = text[header.end():end]
            codes = table_courses(section)
            slots = []
            for slot in SLOT_RE.finditer(section):
                slots.append({
                    "courseCode": "",
                    "courseName": clean_text(slot.group(1)),
                    "category": slot.group(6).upper(),
                    "lectureHours": int(slot.group(2)),
                    "tutorialHours": int(slot.group(3)),
                    "practicalHours": int(slot.group(4)),
                    "credits": int(slot.group(5)),
                    "detailsAvailable": False,
                    "verificationNote": "The curriculum table lists this elective or mandatory slot without a course code.",
                })
            semesters.append({"number": number, "name": f"Semester {roman}", "courses": codes + slots})
    return sorted(semesters, key=lambda item: item["number"])


def parse_detail_pages(texts):
    starts = []
    for page_index, text in enumerate(texts):
        header_index = text.find("L T P C")
        if header_index < 0:
            continue
        code_match = CODE_RE.search(text[:header_index])
        if code_match:
            starts.append((page_index, code_match.group(0), code_match.end(), header_index))

    details = {}
    for index, (page_index, code, code_end, header_index) in enumerate(starts):
        next_page = starts[index + 1][0] if index + 1 < len(starts) else len(texts)
        header = texts[page_index][code_end:header_index]
        title_lines = [line.strip() for line in header.splitlines() if line.strip()]
        title = clean_text(" ".join(line for line in title_lines if not line.startswith("(")))
        raw_pages = [texts[i] for i in range(page_index, next_page)]
        full_text = "\n\n".join(raw_pages).strip()
        details[code] = {
            "officialTitle": title,
            "detailsText": full_text,
            "sourcePages": [page_index + 1, next_page],
            "ltpc": next((
                [int(value) for value in match.groups()]
                for match in [re.search(r"L T P C\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)", texts[page_index][header_index:])]
                if match
            ), None),
        }
    return details


def main():
    if len(sys.argv) != 3:
        raise SystemExit("Usage: python scripts/import_r2023_curriculum.py <source-pdf> <output-json>")

    source_pdf = Path(sys.argv[1])
    output_json = Path(sys.argv[2])
    source_pdf_url = f"/uploads/{source_pdf.name}" if source_pdf.parent.name.lower() == "uploads" else "/uploads/R2023-MECH-CURRICULUM-AND-SYLLABUS.pdf"
    reader = PdfReader(str(source_pdf))
    texts = [page.extract_text() or "" for page in reader.pages]
    semesters = parse_semesters(texts)
    table_courses_by_code = {}

    for semester in semesters:
        for course in semester["courses"]:
            if course["courseCode"]:
                table_courses_by_code[course["courseCode"]] = course

    elective_catalog = []
    conflicting_codes = {}
    for page_index in range(9, 14):
        default_category = "PE" if page_index <= 11 else ("OE" if page_index == 13 else None)
        for course in table_courses(texts[page_index], default_category):
            existing_course = table_courses_by_code.get(course["courseCode"])
            if existing_course and existing_course["courseName"] != course["courseName"]:
                conflicting_codes.setdefault(course["courseCode"], set()).update([existing_course["courseName"], course["courseName"]])
            if course["courseCode"] not in table_courses_by_code:
                table_courses_by_code[course["courseCode"]] = course
            elective_catalog.append(course)

    detail_pages = parse_detail_pages(texts)
    courses = []
    for code, table_course in table_courses_by_code.items():
        course = dict(table_course)
        detail = detail_pages.get(code)
        course["regulation"] = "2023"
        course["programme"] = "B.E. Mechanical Engineering"
        course["published"] = True
        course["detailsAvailable"] = bool(detail)
        if detail:
            course["officialTitle"] = detail["officialTitle"]
            course["detailsText"] = detail["detailsText"]
            course["sourcePages"] = detail["sourcePages"]
        else:
            course["verificationNote"] = "No detailed course page was found in the supplied PDF; verify against the official document."
        if code in conflicting_codes:
            course["verificationNote"] = f"{course.get('verificationNote', '')} The PDF assigns this code to multiple titles: {'; '.join(sorted(conflicting_codes[code]))}. Verify the correct offering before use.".strip()
        courses.append(course)

    for code, detail in detail_pages.items():
        if code in table_courses_by_code:
            continue
        ltpc = detail["ltpc"] or [None, None, None, None]
        courses.append({
            "courseCode": code,
            "courseName": detail["officialTitle"],
            "officialTitle": detail["officialTitle"],
            "category": None,
            "lectureHours": ltpc[0],
            "tutorialHours": ltpc[1],
            "practicalHours": ltpc[2],
            "credits": ltpc[3],
            "regulation": "2023",
            "programme": "B.E. Mechanical Engineering",
            "published": True,
            "detailsAvailable": True,
            "verificationNote": "Course details are present, but a matching curriculum-table row was not found in the extracted PDF text.",
            "detailsText": detail["detailsText"],
            "sourcePages": detail["sourcePages"],
        })

    for semester in semesters:
        for course in semester["courses"]:
            if course["courseCode"]:
                course["courseName"] = table_courses_by_code.get(course["courseCode"], course)["courseName"]
                course["detailsAvailable"] = course["courseCode"] in detail_pages

    for course in elective_catalog:
        if course["courseCode"] in conflicting_codes:
            course["verificationNote"] = f"The PDF assigns this code to multiple titles: {'; '.join(sorted(conflicting_codes[course['courseCode']]))}. Verify the correct offering before use."

    profile_text = "\n\n".join(texts[:4]).strip()
    summary_text = texts[7]
    output = {
        "regulation": "2023",
        "programme": "B.E. Mechanical Engineering",
        "institution": "Coimbatore Institute of Engineering and Technology",
        "academicYear": "Students admitted from 2023–2024 onwards",
        "system": "Choice Based Credit System",
        "sourceDocument": {
            "fileName": source_pdf.name if source_pdf.parent.name.lower() == "uploads" else "R2023 MECH CURRICULUM AND SYLLABUS.pdf",
            "fileUrl": source_pdf_url,
            "pageCount": len(reader.pages),
        },
        "programmeInformationText": profile_text,
        "creditSummarySourceText": summary_text,
        "semesters": semesters,
        "electiveCatalog": elective_catalog,
        "courses": courses,
        "extractionNotes": [
            "Course detail text is preserved as extracted from the official PDF.",
            "Rows without a detailed course page are marked for administrator verification.",
            "Semester credit totals are calculated from imported course rows; compare with the official credit summary in the source PDF.",
            "The semester V course table sums to 25 credits while the official summary table lists 24; semester VII sums to 15 while the summary lists 16. The overall total remains 164 in both. Both source passages are preserved for verification.",
            "The source PDF lists U23OE057 for both Open-Source Software and Virtual Reality; both rows are preserved and flagged for administrator verification.",
        ],
    }
    output_json.parent.mkdir(parents=True, exist_ok=True)
    output_json.write_text(json.dumps(output, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Imported {len(courses)} coded courses and {len(detail_pages)} detailed course pages across {len(semesters)} semesters from {len(reader.pages)} PDF pages.")


if __name__ == "__main__":
    main()
