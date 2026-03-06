export type Screening = {
  id: string;
  movieId: string;
  startTime: string;
  price: number;
  room: {
    id: string;
    name: string;
    capacity: number;
  };
};
