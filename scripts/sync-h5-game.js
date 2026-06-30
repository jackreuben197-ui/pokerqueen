const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// 目录路径定义 (基于 __dirname，假设文件位于 /scripts/build.js)
const h5GameDir = path.resolve(__dirname, '../deps/h5-game');
const distDir = path.join(h5GameDir, 'dist');
const targetDir = path.resolve(__dirname, '../build-templates/web-mobile');

/**
 * 封装执行命令的函数
 */
function runCommand(command, cwd = process.cwd()) {
    console.log(`\n> 执行: ${command}`);
    try {
        execSync(command, { cwd, stdio: 'inherit' });
    } catch (error) {
        console.error(`\n[ERROR] 命令执行失败: ${command}`);
        process.exit(1);
    }
}

// 检查仓库是否存在
if (!fs.existsSync(h5GameDir)) {
    console.error(`[ERROR] 子模块目录不存在: ${h5GameDir}，请检查路径。`);
    process.exit(1);
}

console.log('--- 开始自动化构建任务 ---');

// [1/5] Git 操作
console.log('\n[1/5] 更新子模块代码...');
runCommand('git fetch --all', h5GameDir);
runCommand('git reset --hard origin/master', h5GameDir);

// [2/5] Build h5-game
console.log('\n[2/5] 开始构建 h5-game...');
runCommand('pnpm install', h5GameDir);
runCommand('pnpm build', h5GameDir);

// [3/5] Copy dist
console.log('\n[3/5] 复制 dist 文件...');
try {
    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
    }
    fs.cpSync(distDir, targetDir, { recursive: true, force: true });
    console.log('复制成功。');
} catch (error) {
    console.error(`[ERROR] 复制文件失败: ${error.message}`);
    process.exit(1);
}

// [3.5/5] 注入 Cocos resize null 防护
// h5-game 的 index.html 由别人维护，同步过来的副本在此打补丁：cocos 引擎为异步加载，
// boot() 完成前 cc.game.container/canvas 为 null，此时若 window resize 触发 cc.view._resizeEvent
// → _initFrameSize 会读 null.style 崩溃。轮询等 cc.view 就绪后 patch _resizeEvent/setCanvasSize，
// 画布未就绪时直接跳过。标记名 __previewNullGuardPatched__ 与 sync-template.js 对齐，便于预览模板去重。
console.log('\n[3.5/5] 注入 Cocos resize null 防护...');
try {
    const targetIndex = path.join(targetDir, 'index.html');
    const GUARD_TOKEN = '__previewNullGuardPatched__';
    let html = fs.readFileSync(targetIndex, 'utf-8');
    if (html.includes(GUARD_TOKEN)) {
        console.log('防护已存在，跳过。');
    } else {
        const guard = `
    <!-- Cocos resize 空引用防护（构建版补丁，与 preview-templates 对齐）：cocos 引擎异步加载，
         boot() 完成前 cc.game.container/canvas 为 null，window resize 触发 _resizeEvent →
         _initFrameSize 会读 null.style 崩溃。轮询等 cc.view 就绪后 patch _resizeEvent/setCanvasSize，
         画布未就绪时直接跳过。标记 __previewNullGuardPatched__ 供 sync-template 去重。 -->
    <script>
      ;(function () {
        function patchOnce() {
          if (!window.cc || !cc.view || cc.view.${GUARD_TOKEN}) {
            return !!(window.cc && cc.view && cc.view.${GUARD_TOKEN})
          }
          var view = cc.view
          var originalSetCanvasSize = typeof view.setCanvasSize === 'function' ? view.setCanvasSize : null
          var originalResizeEvent = typeof view._resizeEvent === 'function' ? view._resizeEvent : null
          if (originalSetCanvasSize) {
            view.setCanvasSize = function (width, height) {
              if (!this._canvas || !this._frame) return
              return originalSetCanvasSize.call(this, width, height)
            }
          }
          if (originalResizeEvent) {
            view._resizeEvent = function () {
              if (!this._canvas || !this._frame) return
              return originalResizeEvent.apply(this, arguments)
            }
          }
          view.${GUARD_TOKEN} = true
          return true
        }
        if (patchOnce()) return
        var retryCount = 0
        var timer = setInterval(function () {
          retryCount++
          if (patchOnce() || retryCount > 200) clearInterval(timer)
        }, 50)
        window.addEventListener('beforeunload', function () { clearInterval(timer) })
      })()
    </script>`;
        const closeIdx = html.lastIndexOf('</body>');
        if (closeIdx >= 0) {
            html = html.slice(0, closeIdx) + guard + '\n' + html.slice(closeIdx);
        } else {
            html += guard;
        }
        fs.writeFileSync(targetIndex, html, 'utf-8');
        console.log('✓ null 防护已注入 build-templates/web-mobile/index.html');
    }
} catch (error) {
    console.error(`[ERROR] 注入 null 防护失败: ${error.message}`);
    process.exit(1);
}

// [4/5] Run sync:template
console.log('\n[4/5] 执行 sync:template...');
runCommand('npm run sync:template');

// [5/5] Merge i18n
console.log('\n[5/5] 合并 i18n 文件...');
runCommand('npm run merge:i18n');

console.log('\n--- 全部任务执行完毕 ---');