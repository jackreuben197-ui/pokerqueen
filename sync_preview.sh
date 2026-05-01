#!/usr/bin/env bash

set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
H5_GAME_DIR="${SCRIPT_DIR}/../h5-game"
DIST_DIR="${H5_GAME_DIR}/dist"
TARGET_DIR="${SCRIPT_DIR}/build-templates/web-mobile"

pause() {
    read -r -p "Press Enter to continue..." _
}

echo "============================================"
echo "[1/5] Git pull ../h5-game"
echo "============================================"

if [[ ! -d "${H5_GAME_DIR}" ]]; then
    echo "ERROR: ../h5-game not found"
    pause
    exit 1
fi

pushd "${H5_GAME_DIR}" >/dev/null || {
    echo "ERROR: failed to enter ../h5-game"
    pause
    exit 1
}
# DON'T RECOVER LOCAL CHANGES, JUST FETCH LATEST FROM REMOTE
if ! git fetch origin master; then
    echo "ERROR: git fetch origin master failed"
    popd >/dev/null
    pause
    exit 1
fi

# if ! git reset --hard origin/master; then
#     echo "ERROR: git reset --hard origin/master failed"
#     popd >/dev/null
#     pause
#     exit 1
# fi

echo
echo "============================================"
echo "[2/5] Build h5-game"
echo "============================================"

if ! pnpm install; then
    echo "ERROR: pnpm install failed"
    popd >/dev/null
    pause
    exit 1
fi

if ! pnpm build; then
    echo "ERROR: pnpm build failed"
    popd >/dev/null
    pause
    exit 1
fi

popd >/dev/null
echo

echo "============================================"
echo "[3/5] Copy dist to build-templates/web-mobile/"
echo "============================================"

if [[ ! -d "${DIST_DIR}" ]]; then
    echo "ERROR: source dist folder not found: ${DIST_DIR}"
    pause
    exit 1
fi

mkdir -p "${TARGET_DIR}"

if ! rsync -a "${DIST_DIR}/" "${TARGET_DIR}/"; then
    echo "ERROR: copy failed, check ../h5-game/dist/"
    pause
    exit 1
fi

echo
echo "============================================"
echo "[4/5] Run sync:template"
echo "============================================"

if ! (cd "${SCRIPT_DIR}" && npm run sync:template); then
    echo "ERROR: npm run sync:template failed"
    pause
    exit 1
fi

echo
echo "============================================"
echo "[5/5] Merge i18n files"
echo "============================================"

if ! (cd "${SCRIPT_DIR}" && npm run merge:i18n); then
    echo "ERROR: npm run merge:i18n failed"
    pause
    exit 1
fi

echo
echo "============================================"
echo "All done!"
echo "============================================"
pause
