export type Screening = {
  id: number;
  movieId: number;
  startTime: string;
  price: number;
  room: {
    id: number;
    name: string;
    capacity: number;
  };
};
