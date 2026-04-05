import { createServer } from "node:http";
import type { AddressInfo } from "node:net";

import { exportJWK, generateKeyPair, SignJWT } from "jose";

export async function createJwksServer() {
  const { privateKey, publicKey } = await generateKeyPair("RS256");
  const jwk = await exportJWK(publicKey);
  jwk.kid = "integration-key";

  const server = createServer((request, response) => {
    if (request.url === "/.well-known/openid-configuration") {
      response.writeHead(200, { "content-type": "application/json" });
      response.end(
        JSON.stringify({
          issuer,
          jwks_uri: `${issuer}/jwks`
        })
      );
      return;
    }

    if (request.url === "/jwks") {
      response.writeHead(200, { "content-type": "application/json" });
      response.end(JSON.stringify({ keys: [jwk] }));
      return;
    }

    response.writeHead(404);
    response.end();
  });

  await new Promise<void>((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve());
  });

  const address = server.address() as AddressInfo;
  const issuer = `http://127.0.0.1:${address.port}`;

  return {
    issuer,
    jwksUri: `${issuer}/jwks`,
    audience: "ledger-ops",
    async signSubjectToken(subject: string) {
      return new SignJWT({})
        .setProtectedHeader({
          alg: "RS256",
          kid: "integration-key"
        })
        .setIssuer(issuer)
        .setAudience("ledger-ops")
        .setSubject(subject)
        .setExpirationTime("10m")
        .sign(privateKey);
    },
    async close() {
      await new Promise<void>((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);
            return;
          }

          resolve();
        });
      });
    }
  };
}
