import type { ActorType } from "@/common/domain/types";

export interface JwtPayload {
  sub: string;
  actorType: ActorType;
  roles: string[];
}
