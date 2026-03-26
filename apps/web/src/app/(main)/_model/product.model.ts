export type MartType = 'emart' | 'lotte' | 'homeplus' | 'marketkurly' | 'wisely';

export type ProductCategory = '과일' | '채소' | '유제품' | '냉동식품' | '간편식';

export type CompareProductItem = {
  id: string;
  mart: MartType;
  category: ProductCategory;
  name: string;
  imageUrl: string;
  price: number;
  popularity: number;
};

export type CompareFilter = {
  keyword: string;
  category: ProductCategory | '전체';
  sort: 'price_asc' | 'popularity_desc';
};
