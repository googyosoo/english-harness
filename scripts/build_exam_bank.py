import os
import sys
import re
import json
import pypdf

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='backslashreplace')

BASE_DIR = os.path.join(os.getcwd(), 'data', 'exam_pdfs')

def get_clean_lines(filepath, max_pages=6):
    try:
        reader = pypdf.PdfReader(filepath)
        lines = []
        for i in range(min(max_pages, len(reader.pages))):
            txt = reader.pages[i].extract_text() or ''
            for l in txt.split('\n'):
                s = l.strip()
                if s:
                    lines.append(s)
        return lines
    except Exception:
        return []

def parse_sol_file(filepath):
    lines = get_clean_lines(filepath, max_pages=8)
    questions = []
    current_q = None
    script_lines = []
    words = []

    for line in lines:
        # 문항 시작 탐지: 1. [출제의도] 또는 1. 다음을
        m = re.match(r'^(\d{1,2})\.\s*(\[출제의도\]|다음을|대화를|글의|다음)', line)
        if m:
            if current_q and script_lines:
                clean_script = ' '.join(script_lines)
                if len(clean_script) > 30:
                    questions.append({
                        'qNumber': current_q,
                        'script': clean_script,
                        'words': words[:6]
                    })
            current_q = int(m.group(1))
            script_lines = []
            words = []
            continue

        if current_q and current_q <= 17:
            if re.match(r'^(M|W|Man|Woman|Boy|Girl):', line) or (script_lines and not re.search(r'[가-힣]{3,}', line)):
                script_lines.append(line)
            elif ' ' in line and any(c >= '가' and c <= '힣' for c in line):
                parts = line.split()
                if len(parts) >= 2 and re.match(r'^[a-zA-Z]{3,}', parts[0]):
                    words.append({'word': parts[0], 'meaning': ' '.join(parts[1:])})

    if current_q and script_lines:
        clean_script = ' '.join(script_lines)
        if len(clean_script) > 30:
            questions.append({
                'qNumber': current_q,
                'script': clean_script,
                'words': words[:6]
            })
    return questions

def parse_prob_file(filepath):
    lines = get_clean_lines(filepath, max_pages=8)
    passages = []
    current_q = None
    body_lines = []
    q_title = ""

    target_numbers = [20, 21, 22, 23, 24, 29, 31, 32, 33, 34, 37, 40]

    for line in lines:
        m = re.match(r'^(\d{1,2})\.\s*(.*)', line)
        if m and int(m.group(1)) in target_numbers:
            if current_q and body_lines:
                body = ' '.join(body_lines)
                # ① 이전 지문만
                opts = re.split(r'[①②③④⑤]', body)
                p = opts[0].strip()
                if len(p) > 100:
                    passages.append({
                        'qNumber': current_q,
                        'title': q_title,
                        'passage': p
                    })
            current_q = int(m.group(1))
            q_title = m.group(2).strip()
            body_lines = []
            continue

        if current_q:
            # 다음 번호 시작 전까지 수집
            if re.match(r'^\d{1,2}\.', line):
                if body_lines:
                    body = ' '.join(body_lines)
                    opts = re.split(r'[①②③④⑤]', body)
                    p = opts[0].strip()
                    if len(p) > 100:
                        passages.append({
                            'qNumber': current_q,
                            'title': q_title,
                            'passage': p
                        })
                current_q = None
                body_lines = []
            elif not re.match(r'^\d\s+\d|이 문제지에 관한|홀수형|짝수형', line):
                body_lines.append(line)

    if current_q and body_lines:
        body = ' '.join(body_lines)
        opts = re.split(r'[①②③④⑤]', body)
        p = opts[0].strip()
        if len(p) > 100:
            passages.append({
                'qNumber': current_q,
                'title': q_title,
                'passage': p
            })
    return passages

def main():
    print("=== 기출 PDF 문항 파싱 시작 (안전 라인 스트리밍) ===", flush=True)
    exam_bank = []
    grades = ['고1', '고2', '고3']

    type_mapping = {
        20: '필자의 주장 파악',
        21: '밑줄 친 부분의 함축 의미 추론',
        22: '글의 요지 파악',
        23: '글의 주제 파악',
        24: '글의 제목 파악',
        29: '문맥상 어법 적절성',
        31: '빈칸 추론 (어휘)',
        32: '빈칸 추론 (구문)',
        33: '고난도 킬러 빈칸추론',
        34: '초고난도 킬러 빈칸추론',
        37: '글의 순서 배열',
        40: '문단 요약문 완성'
    }

    for grade in grades:
        g_dir = os.path.join(BASE_DIR, grade)
        if not os.path.exists(g_dir):
            continue

        files = os.listdir(g_dir)
        exams = {}
        for f in files:
            m = re.match(r'(\d{4})_([^_\s]+)_' + grade + r'_영어_(문제|해설|듣기대본|정답)\.pdf', f)
            if m:
                y, mo, tp = m.group(1), m.group(2), m.group(3)
                key = f"{y}_{mo}_{grade}"
                if key not in exams:
                    exams[key] = {'year': y, 'month': mo, 'grade': grade}
                exams[key][tp] = os.path.join(g_dir, f)

        print(f"[{grade}] 총 {len(exams)}개 회차 분석 진행 중...", flush=True)

        for key, info in sorted(exams.items(), reverse=True):
            y = info['year']
            mo = info['month']
            prob_pdf = info.get('문제')
            sol_pdf = info.get('해설') or info.get('듣기대본')

            # 듣기 문항 추출
            if sol_pdf and os.path.exists(sol_pdf):
                l_items = parse_sol_file(sol_pdf)
                for l in l_items:
                    exam_bank.append({
                        'id': f"{y}-{mo}-{grade}-L{l['qNumber']:02d}",
                        'year': y,
                        'exam': mo,
                        'grade': grade,
                        'qNumber': l['qNumber'],
                        'category': 'listening',
                        'type': f"듣기 {l['qNumber']}번 실전",
                        'title': f"[{y}년 {mo} {grade}] 듣기 {l['qNumber']}번 원어민 담화",
                        'script': l['script'],
                        'words': l.get('words', []),
                        'cefrLevel': 'A2+' if grade == '고1' else 'B1~B2' if grade == '고2' else 'B2~C1',
                        'lexile': '850L' if grade == '고1' else '1050L' if grade == '고2' else '1200L',
                        'suggestedActivities': ['listening', 'speaking']
                    })

            # 독해 문항 추출
            if prob_pdf and os.path.exists(prob_pdf):
                r_items = parse_prob_file(prob_pdf)
                for r in r_items:
                    q_num = r['qNumber']
                    q_type = type_mapping.get(q_num, '독해 지문')
                    exam_bank.append({
                        'id': f"{y}-{mo}-{grade}-R{q_num:02d}",
                        'year': y,
                        'exam': mo,
                        'grade': grade,
                        'qNumber': q_num,
                        'category': 'reading',
                        'type': q_type,
                        'title': f"[{y}년 {mo} {grade}] {q_num}번 {q_type}",
                        'passage': r['passage'],
                        'cefrLevel': 'B1' if grade == '고1' else 'B2' if grade == '고2' else 'C1',
                        'lexile': '920L' if grade == '고1' else '1100L' if grade == '고2' else '1300L',
                        'suggestedActivities': ['reading', 'writing', 'read-write']
                    })

    print(f"\n총 {len(exam_bank)}개 실제 기출 문항 추출 성공!", flush=True)

    # TypeScript 데이터베이스 저장
    ts_path = os.path.join(os.getcwd(), 'src', 'data', 'examBank.ts')
    with open(ts_path, 'w', encoding='utf-8') as tf:
        tf.write("// 자동 생성된 2020~2026년 고1, 고2, 고3 전국연합학력평가/수능 기출 문항 데이터베이스\n\n")
        tf.write("export interface ExamBankItem {\n")
        tf.write("  id: string;\n")
        tf.write("  year: string;\n")
        tf.write("  exam: string;\n")
        tf.write("  grade: '고1' | '고2' | '고3';\n")
        tf.write("  qNumber: number;\n")
        tf.write("  category: 'listening' | 'reading' | 'integrated';\n")
        tf.write("  type: string;\n")
        tf.write("  title: string;\n")
        tf.write("  script?: string;\n")
        tf.write("  passage?: string;\n")
        tf.write("  words?: { word: string; meaning: string }[];\n")
        tf.write("  cefrLevel: string;\n")
        tf.write("  lexile: string;\n")
        tf.write("  suggestedActivities: string[];\n")
        tf.write("}\n\n")
        tf.write(f"export const EXAM_BANK: ExamBankItem[] = {json.dumps(exam_bank, ensure_ascii=False, indent=2)};\n")
    print(f"TypeScript 데이터베이스 저장 완료: {ts_path}", flush=True)

if __name__ == '__main__':
    main()
