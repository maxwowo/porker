export interface RoomStub {
  fetch(input: string | Request, init?: RequestInit): Promise<Response>;
}

export interface Env {
  ROOMS: {
    getByName(name: string): RoomStub;
  };
}
