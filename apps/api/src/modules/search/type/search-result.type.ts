export type SearchResult = {
  categories: Array<{ id: string; name: string }>;
  products: Array<{
    id: string;
    name: string;
    mart: string;
    price: number;
    categoryId: string;
  }>;
};
