# MAGE export service image.  Build from the repository root so the
# @ngageoint/mage.service package can be built and linked:
#   docker build -f services/export/Dockerfile -t mage-export-service .
ARG BUILD_IMAGE="node:24-slim"
ARG DIST_IMAGE="ghcr.io/ngageoint/mage-server/ironbank/google/distroless13/nodejs-24:nonroot"
ARG MAGE_HOME="/mage"
ARG MAGE_SERVER="${MAGE_HOME}/mage-server"
ARG MAGE_PACKAGES="${MAGE_HOME}/packages"
ARG MAGE_INSTANCE="${MAGE_HOME}/instance"

FROM ${BUILD_IMAGE} AS build-instance
ARG MAGE_SERVER
ARG MAGE_PACKAGES
ARG MAGE_INSTANCE
RUN mkdir -p ${MAGE_SERVER} ${MAGE_PACKAGES}
COPY ./service ${MAGE_SERVER}/service/
COPY ./services/export ${MAGE_SERVER}/services/export/

RUN cd ${MAGE_SERVER}/service \
    && npm ci \
    && npm run build \
    && cd ${MAGE_PACKAGES} \
    && npm pack ${MAGE_SERVER}/service

RUN cd ${MAGE_SERVER}/services/export \
    && npm install \
    && npm link ../../service \
    && npm run build \
    && cd ${MAGE_PACKAGES} \
    && npm pack ${MAGE_SERVER}/services/export

WORKDIR ${MAGE_INSTANCE}
RUN npm install --omit dev --force \
    ${MAGE_PACKAGES}/ngageoint-mage.service-*.tgz \
    ${MAGE_PACKAGES}/ngageoint-mage.export.service-*.tgz \
    && ln -s ./node_modules/.bin/mage.export.service

FROM ${DIST_IMAGE}
WORKDIR /var/lib/mage
ARG MAGE_INSTANCE
ENV MAGE_INSTANCE=${MAGE_INSTANCE}
USER 999:999
COPY --chown=999:999 --from=build-instance ${MAGE_INSTANCE}/ ${MAGE_INSTANCE}/
WORKDIR ${MAGE_INSTANCE}
VOLUME /var/lib/mage
# internal only: compose exposes this port on the private network, never publishes it
EXPOSE 4243

CMD [ "./mage.export.service" ]
