# Deployment manifests

`deploy/templates/` contains provider-agnostic Kubernetes-style resources that describe how to wire the NestJS service to config, secrets, and networking. Use your platform's toolchain (Helm, Kustomize, Argo CD, Terraform, etc.) to inject:

- a platform-managed secret store instead of committing sensitive values from `secret-template.yaml`
- a config map with runtime knobs from `configmap.yaml`
- the proper namespace, image, and replica count for `app-deployment.yaml`
- the load balancer or ingress solution that sits in front of `app-service.yaml`

Custom overlays can add provider-specific CRDs (Ingress, LoadBalancer, pod disruption budgets, CSV-style rollouts). Treat these templates as the durable, auditable source for what a production-grade deployment should look like.
