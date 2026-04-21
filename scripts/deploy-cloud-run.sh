#!/usr/bin/env bash

set -euo pipefail

trim() {
  printf '%s' "$1" | tr -d '\r' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//'
}

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

GCP_PROJECT_ID="$(trim "${GCP_PROJECT_ID}")"
GCP_REGION="$(trim "${GCP_REGION}")"
ARTIFACT_REGISTRY_REPOSITORY="$(trim "${ARTIFACT_REGISTRY_REPOSITORY}")"
SERVICE_NAME="$(trim "${SERVICE_NAME}")"
SERVICE_ACCOUNT_EMAIL="$(trim "${SERVICE_ACCOUNT_EMAIL}")"
GCS_BUCKET="$(trim "${GCS_BUCKET}")"
VOICEVOX_API_BASE_URL="$(trim "${VOICEVOX_API_BASE_URL}")"
CLOUD_SQL_CONNECTION_NAME="$(trim "${CLOUD_SQL_CONNECTION_NAME:-}")"

IMAGE_NAME="${IMAGE_NAME:-hitsujii-sleep-school-backend}"
IMAGE_TAG="${IMAGE_TAG:-$(date +%Y%m%d-%H%M%S)}"
IMAGE_NAME="$(trim "${IMAGE_NAME}")"
IMAGE_TAG="$(trim "${IMAGE_TAG}")"
IMAGE_URI="${GCP_REGION}-docker.pkg.dev/${GCP_PROJECT_ID}/${ARTIFACT_REGISTRY_REPOSITORY}/${IMAGE_NAME}:${IMAGE_TAG}"
DATABASE_SSL="${DATABASE_SSL:-false}"

DATABASE_URL_SECRET_NAME="${DATABASE_URL_SECRET_NAME:-DATABASE_URL}"
JWT_SECRET_NAME="${JWT_SECRET_NAME:-JWT_SECRET}"
JWT_ISSUER="${JWT_ISSUER:-hitsujii-sleep-school}"
JWT_AUDIENCE="${JWT_AUDIENCE:-hitsujii-sleep-school-clients}"
APP_NAME="${APP_NAME:-hitsujii-sleep-school-backend}"
MIN_INSTANCES="${MIN_INSTANCES:-0}"
MAX_INSTANCES="${MAX_INSTANCES:-10}"
ALLOW_UNAUTHENTICATED="${ALLOW_UNAUTHENTICATED:-true}"
CLOUD_BUILD_SOURCE_STAGING_DIR="${CLOUD_BUILD_SOURCE_STAGING_DIR:-gs://${GCS_BUCKET}/cloudbuild/source}"
CLOUD_BUILD_LOG_DIR="${CLOUD_BUILD_LOG_DIR:-gs://${GCS_BUCKET}/cloudbuild/logs}"

DATABASE_URL_SECRET_NAME="$(trim "${DATABASE_URL_SECRET_NAME}")"
JWT_SECRET_NAME="$(trim "${JWT_SECRET_NAME}")"
JWT_ISSUER="$(trim "${JWT_ISSUER}")"
JWT_AUDIENCE="$(trim "${JWT_AUDIENCE}")"
APP_NAME="$(trim "${APP_NAME}")"
MIN_INSTANCES="$(trim "${MIN_INSTANCES}")"
MAX_INSTANCES="$(trim "${MAX_INSTANCES}")"
ALLOW_UNAUTHENTICATED="$(trim "${ALLOW_UNAUTHENTICATED}")"
CLOUD_BUILD_SOURCE_STAGING_DIR="$(trim "${CLOUD_BUILD_SOURCE_STAGING_DIR}")"
CLOUD_BUILD_LOG_DIR="$(trim "${CLOUD_BUILD_LOG_DIR}")"
DATABASE_SSL="$(trim "${DATABASE_SSL}")"

echo "Building image: ${IMAGE_URI}"
gcloud builds submit \
  --project "${GCP_PROJECT_ID}" \
  --config cloudbuild.yaml \
  --gcs-source-staging-dir "${CLOUD_BUILD_SOURCE_STAGING_DIR}" \
  --gcs-log-dir "${CLOUD_BUILD_LOG_DIR}" \
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
  --set-env-vars "NODE_ENV=production,APP_NAME=${APP_NAME},GOOGLE_CLOUD_PROJECT=${GCP_PROJECT_ID},GCS_BUCKET=${GCS_BUCKET},VOICEVOX_API_BASE_URL=${VOICEVOX_API_BASE_URL},JWT_ISSUER=${JWT_ISSUER},JWT_AUDIENCE=${JWT_AUDIENCE},DATABASE_SSL=${DATABASE_SSL}"
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
