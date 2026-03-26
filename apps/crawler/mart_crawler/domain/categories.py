from __future__ import annotations

from ..core.config import Settings


MART_SOURCE_CATEGORIES: dict[str, list[str]] = {
    "emart": [
        "과일",
        "채소",
        "쌀/잡곡/견과",
        "정육/계란류",
        "수산물/건해산",
        "우유/유제품",
        "밀키트/간편식",
        "김치/반찬/델리",
        "생수/음료/주류",
        "커피/원두/차",
        "면류/통조림",
        "양념/오일",
        "과자/간식",
        "베이커리/잼",
        "건강식품",
        "친환경/유기농",
        "제지/위생/건강",
        "헤어/바디/뷰티",
        "청소/생활용품",
    ],
    "lottemart": [
        "과일",
        "채소",
        "쌀/잡곡/견과",
        "정육/계란류",
        "수산물/건해산물",
        "델리/즉석조리",
        "베이커리/빵/잼",
        "우유/유제품",
        "김치/반찬/젓갈",
        "라면/통조림/즉석밥",
        "건면/생면/면요리",
        "양념/오일/분말류",
        "간편식/밀키트",
        "햄/어묵/맛살/닭가슴살",
        "과자/스낵/간식",
        "아이스크림/빙과류",
        "생수/음료",
        "커피/원두",
        "차/액상차/핫초코",
        "수입식품",
        "제지/세제/생활용품",
        "건강식품",
        "헤어/바디/뷰티/구강",
    ],
    "homeplus": [
        "과일",
        "쌀/잡곡",
        "채소",
        "견과",
        "수산물/건어물",
        "정육/계란",
        "델리/치킨/초밥",
        "우유/유제품",
        "냉장/냉동/밀키트",
        "두부/김치/반찬",
        "커피/차",
        "생수/음료",
        "주류매직픽업",
        "과자/시리얼",
        "베이커리/잼",
        "라면/즉석식품/통조림",
        "장류/양념/제빵",
        "세탁/청소/욕실",
        "제지/위생/뷰티",
        "건강식품",
        "주방용품",
    ],
    "marketkurly": [
        "채소",
        "과일/견과/쌀",
        "수산/해산/건어물",
        "정육/가공육/달걀",
        "국/반찬/메인요리",
        "간편식/밀키트/샐러드",
        "면/양념/오일",
        "생수/음료",
        "커피/차",
        "간식/과자/떡",
        "베어커리",
        "유제품",
        "건강식품",
        "와인/위스키/데낄라",
        "전통주",
        "주방용품",
        "생활용품/리빙",
    ],
    "wisely": [
        "과일/채소/쌀",
        "정육/계란",
        "간편식/반찬",
        "양념/오일/꿀",
        "간식",
        "수산/건어물",
        "견과/건과",
        "음료",
        "베이커리/잼",
        "식단관리",
        "생활용품",
        "주방용품",
        "구강용품",
        "욕실용품",
        "방향/탈취",
    ],
}


def build_mart_category_url(mart: str, source_category: str, settings: Settings) -> str:
    from urllib.parse import quote_plus

    if mart == "emart":
        return f"https://emart.ssg.com/search.ssg?target=all&query={quote_plus(source_category)}"
    if mart == "lottemart":
        return f"https://lottemartzetta.com/products/search?q={quote_plus(source_category)}"
    if mart == "homeplus":
        return f"https://mfront.homeplus.co.kr/search?keyword={quote_plus(source_category)}"
    if mart == "marketkurly":
        return settings.marketkurly_category_url
    if mart == "wisely":
        base = (settings.wisely_category_url or "https://shop.wisely.store/").rstrip("/")
        if "/category/" in base or base.endswith("/categories"):
            return base
        return f"{base}/categories"
    raise ValueError(f"Unsupported mart: {mart}")


def classify_source_category(source_category: str) -> tuple[str, str]:
    s = source_category.lower()

    if any(k in s for k in ["과일", "채소", "쌀", "잡곡", "견과", "정육", "계란", "가공육", "수산", "해산", "건해산", "건어물", "우유", "유제품", "두부", "김치", "반찬", "델리", "즉석조리", "초밥", "치킨"]):
        if any(k in s for k in ["과일"]):
            return ("신선식품", "과일")
        if any(k in s for k in ["채소"]):
            return ("신선식품", "채소")
        if any(k in s for k in ["쌀", "잡곡", "견과"]):
            return ("신선식품", "쌀/잡곡/견과")
        if any(k in s for k in ["정육", "계란", "가공육", "닭가슴살", "햄"]):
            return ("신선식품", "정육/계란/가공육")
        if any(k in s for k in ["수산", "해산", "건해산", "건어물"]):
            return ("신선식품", "수산/해산/건해산/건어물")
        if any(k in s for k in ["우유", "유제품"]):
            return ("신선식품", "우유/유제품")
        if any(k in s for k in ["두부", "김치", "반찬", "젓갈"]):
            return ("신선식품", "두부/김치/반찬")
        return ("신선식품", "델리/즉석조리/초밥/치킨")

    if any(k in s for k in ["라면", "면", "통조림", "즉석밥", "간편식", "밀키트", "양념", "오일", "분말", "장류", "국", "메인요리", "과자", "간식", "시리얼", "떡", "베이커리", "잼", "제빵"]):
        if any(k in s for k in ["라면", "면류"]):
            return ("가공식품", "라면/면류")
        if any(k in s for k in ["통조림", "즉석밥"]):
            return ("가공식품", "통조림/즉석밥")
        if any(k in s for k in ["간편식", "밀키트"]):
            return ("가공식품", "간편식/밀키트")
        if any(k in s for k in ["양념", "오일", "분말", "장류", "제빵"]):
            return ("가공식품", "양념/오일/분말류/장류")
        if any(k in s for k in ["국", "메인요리"]):
            return ("가공식품", "국/반찬/메인요리")
        if any(k in s for k in ["과자", "간식", "시리얼", "떡", "아이스크림", "빙과"]):
            return ("가공식품", "과자/간식/시리얼/떡")
        if any(k in s for k in ["베이커리", "빵", "잼"]):
            return ("가공식품", "베이커리/잼")
        return ("가공식품", "건면/생면/면요리")

    if any(k in s for k in ["생수", "음료", "커피", "원두", "차", "핫초코", "주류", "와인", "위스키", "전통주", "데낄라"]):
        if any(k in s for k in ["생수"]):
            return ("음료/주류", "생수")
        if any(k in s for k in ["음료"]):
            return ("음료/주류", "음료")
        if any(k in s for k in ["커피", "원두"]):
            return ("음료/주류", "커피/원두")
        if any(k in s for k in ["차", "핫초코", "액상차"]):
            return ("음료/주류", "차/액상차/핫초코")
        if any(k in s for k in ["와인", "위스키", "전통주", "데낄라", "수입주류"]):
            return ("음료/주류", "와인/위스키/전통주/수입주류")
        return ("음료/주류", "주류")

    if any(k in s for k in ["건강", "친환경", "유기농", "제지", "위생", "청소", "세제", "생활용품", "헤어", "바디", "뷰티", "구강", "욕실", "방향", "탈취", "주방", "리빙"]):
        if any(k in s for k in ["건강"]):
            return ("건강/생활", "건강식품")
        if any(k in s for k in ["친환경", "유기농"]):
            return ("건강/생활", "친환경/유기농")
        if any(k in s for k in ["제지", "위생"]):
            return ("건강/생활", "제지/위생")
        if any(k in s for k in ["청소", "세제", "생활용품", "리빙"]):
            return ("건강/생활", "청소/세제/생활용품")
        if any(k in s for k in ["헤어", "바디", "뷰티", "구강"]):
            return ("건강/생활", "헤어/바디/뷰티/구강")
        if any(k in s for k in ["욕실", "방향", "탈취"]):
            return ("건강/생활", "욕실/방향/탈취")
        return ("건강/생활", "주방용품")

    if any(k in s for k in ["식단관리"]):
        return ("기타", "식단관리")
    if any(k in s for k in ["수입식품"]):
        return ("기타", "수입식품")

    return ("기타", "기타")


def extract_category_keywords(source_category: str) -> list[str]:
    overrides: dict[str, list[str]] = {
        "과일/채소/쌀": ["과일", "채소", "쌀", "현미", "잡곡", "곡물"],
        "정육/계란": ["정육", "계란", "달걀", "닭", "돼지", "소고기", "한우"],
        "간편식/반찬": ["반찬", "간편", "즉석", "밀키트", "국", "찌개", "볶음", "덮밥"],
        "양념/오일/꿀": ["양념", "오일", "간장", "고추장", "된장", "소스", "꿀"],
        "간식": ["간식", "과자", "스낵", "쿠키", "초콜릿", "젤리"],
        "수산/건어물": ["수산", "해산", "건어", "멸치", "오징어", "김"],
        "견과/건과": ["견과", "아몬드", "호두", "캐슈", "건과", "건과일"],
        "음료": ["음료", "주스", "탄산", "커피", "차", "티"],
        "베이커리/잼": ["베이커리", "빵", "잼", "식빵", "베이글", "크로와상"],
        "식단관리": ["식단", "단백질", "다이어트", "프로틴", "저당"],
        "생활용품": ["생활", "세탁", "청소", "휴지", "물티슈", "세제"],
        "주방용품": ["주방", "키친", "도마", "칼", "냄비", "수세미", "랩", "지퍼백"],
        "구강용품": ["구강", "치약", "칫솔", "가글", "치실", "덴탈"],
        "욕실용품": ["욕실", "샴푸", "린스", "바디", "클렌징", "비누"],
        "방향/탈취": ["방향", "탈취", "디퓨저", "섬유탈취", "향"],
    }
    if source_category in overrides:
        return [t.lower() for t in overrides[source_category]]

    tokens = [t.strip().lower() for t in source_category.replace(",", "/").split("/") if t.strip()]
    return tokens
