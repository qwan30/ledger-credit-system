# Deployment manifest templates

These Kubernetes-style manifest templates are intentionally provider-agnostic. Copy them into your own workflow (Helm, Kustomize, Argo CD, etc.) and replace the placeholders with environment-specific values.

### Key placeholders

- `<IMAGE>`: fully qualified container image that includes registry, image name, and tag.
- `<APP_NAMESPACE>`: the namespace where the workload runs.
- `<APP_PORT>`: application port (defaults to `3000`).
- `<CONFIGMAP_NAME>` and `<SECRET_NAME>`: names for the config and secret resources that hold runtime values.
- `<REPLICAS>`: horizontal scale target for the application.

### How to use

1. Populate the `ConfigMap` and `Secret` templates with your non-sensitive and sensitive values.
2. Update the `Deployment` template to match your preferred resource budget and health check paths (defaults are `/api/v1/health/live` and `/api/v1/health/ready`).
3. Reference the `Service` template directly or expose the deployment via your ingress/load balancer solution.
4. Keep secrets in your provider's vault or sealed-secret store and never commit them to source control.

These templates are intentionally minimal so you can layer on provider-specific CRDs (Ingress, Gateway API, pod disruption budgets, etc.) in the overlay that suits your runbook.
