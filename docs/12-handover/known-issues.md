# Known Issues

| Issue | Current impact | Suggested follow-up |
|---|---|---|
| Root README was missing before refresh | Onboarding entry point was incomplete | Added in this refresh |
| Docs were flat and partly target-state | Harder to distinguish current source truth | New numbered hierarchy plus archive |
| CI uses Node 22 while Dockerfile uses Node 20 | Compatibility needs explicit validation | Align versions or record tested compatibility |
| External settlement provider is not implemented beyond simulator/mock-bank adapters | Do not claim production settlement | Add provider integration and tests before changing claim |
| No deployment target proof | No operational readiness claim | Add deployment workflow and smoke evidence |
| CORS `origin: true` default | Too permissive outside local development | Configure allowed origins per environment |
| Web workspace is minimal | Not a full admin/ops console | Build UI only when product scope requires it |
