export type Row = {
  id: number;
  code: {
    method: string;
    endpoint: string;
    headers: string;
    body: string;
  };
  time: string;
  date: string;
};
export type ColumnParams = {
  row: Row;
};
