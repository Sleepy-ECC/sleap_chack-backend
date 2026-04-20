#!/usr/bin/env bash

set -euo pipefail

required_vars=(
  GCP_PROJECT_ID
  GCP_REGION
  ARTIFACT_REGISTRY_REPOSITORY
  SERVICE_NAME
  SERVICE_ACCOUNT_EMAIL
  GCS_BUCKET
  VOICEVOX_API_BASE_URL
)

for var_name in "${required_vars[@]}"; do
  if [[ -z "${!var_name:-}" ]]; then
    echo "Missing required env: ${var_name}" >&2
    exit 1
  fi
done

IMAGE_NAME="${IMAGE_NAME:-sleap-check-backend}"
IMAGE_TAG="${IMAGE_TAG:-$(date +%Y%m%d-%H%M%S)}"
IMAGE_URI="${GCP_REGION}-docker.pkg.dev/${GCP_PROJECT_ID}/${ARTIFACT_REGISTRY_REPOSITORY}/${IMAGE_NAME}:${IMAGE_TAG}"

DATABASE_URL_SECRET_NAME="${DATABASE_URL_SECRET_NAME:-DATABASE_URL}"
JWT_SECRET_NAME="${JWT_SECRET_NAME:-JWT_SECRET}"
JWT_ISSUER="${JWT_ISSUER:-sleap-check}"
JWT_AUDIENCE="${JWT_AUDIENCE:-sleap-check-clients}"
APP_NAME="${APP_NAME:-sleap-check-backend}"
MIN_INSTANCES="${MIN_INSTANCES:-0}"
MAX_INSTANCES="${MAX_INSTANCES:-10}"
ALLOW_UNAUTHENTICATED="${ALLOW_UNAUTHENTICATED:-true}"

echo "Building image: ${IMAGE_URI}"
gcloud builds submit \
  --project "${GCP_PROJECT_ID}" \
  --config cloudbuild.yaml \
  --substitutions "_IMAGE_URI=${IMAGE_URI}" \
  .

deploy_args=(
  run deploy "${SERVICE_NAME}"
  --project "${GCP_PROJECT_ID}"
  --region "${GCP_REGION}"
  --platform managed
  --image "${IMAGE_URI}"
  --service-account "${SERVICE_ACCOUNT_EMAIL}"
  --port 8080
  --min-instances "${MIN_INSTANCES}"
  --max-instances "${MAX_INSTANCES}"
  --set-env-vars "NODE_ENV=production,APP_NAME=${APP_NAME},GOOGLE_CLOUD_PROJECT=${GCP_PROJECT_ID},GCS_BUCKET=${GCS_BUCKET},VOICEVOX_API_BASE_URL=${VOICEVOX_API_BASE_URL},JWT_ISSUER=${JWT_ISSUER},JWT_AUDIENCE=${JWT_AUDIENCE}"
  --set-secrets "DATABASE_URL=${DATABASE_URL_SECRET_NAME}:latest,JWT_SECRET=${JWT_SECRET_NAME}:latest"
)

if [[ -n "${CLOUD_SQL_CONNECTION_NAME:-}" ]]; then
  deploy_args+=(--add-cloudsql-instances "${CLOUD_SQL_CONNECTION_NAME}")
fi

if [[ "${ALLOW_UNAUTHENTICATED}" == "true" ]]; then
  deploy_args+=(--allow-unauthenticated)
else
  deploy_args+=(--no-allow-unauthenticated)
fi

echo "Deploying service: ${SERVICE_NAME}"
gcloud "${deploy_args[@]}"
