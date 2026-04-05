import type { ActorType } from "@/common/domain/types";

export interface JwtPayload {
  sub: string;
  pid: string;
  actorType: ActorType;
  roles: string[];
  aud: string;
  iss: string;
  sid: string;
  jti: string;
}
