/**
 * MIT License
 *
 * Copyright (C) 2026 Huawei Device Co., Ltd.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
import path from 'path';

type FsMock = {
  existsSync: jest.Mock;
  readFileSync: jest.Mock;
  writeFileSync: jest.Mock;
  renameSync: jest.Mock;
};

function isSafeHookTarget(filePath: string): boolean {
  const p = String(filePath);
  return (
    p.indexOf('Touchable.js') >= 0 ||
    p.indexOf('Pressability.js') >= 0 ||
    p.indexOf('Slider.js') >= 0 ||
    p.indexOf('Switch.js') >= 0 ||
    p.indexOf('GestureButtons') >= 0 ||
    p.indexOf('BaseNavigationContainer') >= 0
  );
}

function fileContentFor(filePath: string, hooked: boolean): string {
  if (hooked) {
    return '/* THINKINGDATA HOOK */ already';
  }
  if (filePath.indexOf('Touchable.js') >= 0) {
    return 'this.touchableHandlePress(e);';
  }
  if (filePath.indexOf('Pressability.js') >= 0) {
    return 'onPress(event);';
  }
  if (filePath.indexOf('Slider.js') >= 0) {
    return 'onSlidingComplete(event.nativeEvent.value);';
  }
  if (filePath.indexOf('Switch.js') >= 0) {
    return 'if (this.props.onValueChange != null) {\n  this.props.onValueChange(value);\n}';
  }
  if (filePath.indexOf('GestureButtons') >= 0) {
    return 'this.props.onPress(active);';
  }
  if (filePath.indexOf('BaseNavigationContainer') >= 0) {
    return 'isFirstMountRef.current = false;';
  }
  return 'export default function Page() { return null; }';
}

function loadHook(option: string, exists: boolean, hooked: boolean): FsMock {
  jest.resetModules();
  const fsMock: FsMock = {
    existsSync: jest.fn((filePath: string) => {
      if (!exists) {
        return false;
      }
      return isSafeHookTarget(filePath);
    }),
    readFileSync: jest.fn((filePath: string) => fileContentFor(String(filePath), hooked)),
    writeFileSync: jest.fn(),
    renameSync: jest.fn(),
  };
  jest.doMock('fs', () => fsMock);
  process.argv[2] = option;
  const log = jest.spyOn(console, 'log').mockImplementation(() => undefined);
  require('../../ThinkingDataRNHook.js');
  log.mockRestore();
  return fsMock;
}

describe('ThinkingDataRNHook', () => {
  const originalArgv = process.argv.slice();

  afterEach(() => {
    process.argv = originalArgv.slice();
  });

  it('prints default option when argv is unknown', () => {
    const fsMock = loadHook('unknown-flag', false, false);
    expect(fsMock.existsSync).not.toHaveBeenCalled();
  });

  it('runs hook and reset when target files are absent', () => {
    const runFs = loadHook('-run', false, false);
    expect(runFs.existsSync).toHaveBeenCalled();
    const resetFs = loadHook('-reset', false, false);
    expect(resetFs.existsSync).toHaveBeenCalled();
  });

  it('hooks files when they exist and contain insert markers', () => {
    const fsMock = loadHook('-run', true, false);
    expect(fsMock.readFileSync).toHaveBeenCalled();
    expect(fsMock.writeFileSync).toHaveBeenCalled();
    expect(fsMock.renameSync).toHaveBeenCalled();
  });

  it('skips already hooked files on run and restores from backup on reset', () => {
    loadHook('-run', true, true);
    const resetFs = loadHook('-reset', true, true);
    expect(resetFs.renameSync).toHaveBeenCalled();
  });

  it('resolves hook script relative to package directory', () => {
    const realFs = jest.requireActual('fs') as typeof import('fs');
    const packageRoot = path.resolve(__dirname, '../..');
    expect(realFs.existsSync(path.join(packageRoot, 'ThinkingDataRNHook.js'))).toBe(true);
  });
});
