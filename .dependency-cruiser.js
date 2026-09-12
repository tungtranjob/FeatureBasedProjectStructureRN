/**
 * ARCHITECTURAL BOUNDARIES — ENFORCED BY A TOOL, NOT BY GOOD INTENTIONS.
 *
 * Architecturally, this is the most important file in the repo.
 * Without it, feature-first degrades into "nicely named folders" within a few
 * sprints, because nobody remembers the rules when they are in a hurry.
 *
 * Run: npm run arch:check
 * Worth wiring into a pre-commit hook and CI.
 */
module.exports = {
  forbidden: [
    {
      name: 'no-cross-feature-internals',
      comment:
        'Feature A may import feature B only through its public API (@features/b), ' +
        'and must NOT reach into B\'s internal files. This is rule number 1.',
      severity: 'error',
      from: {path: '^src/features/([^/]+)/'},
      to: {
        path: '^src/features/([^/]+)/.+',
        pathNot: ['^src/features/$1/', '^src/features/[^/]+/index\\.ts$'],
      },
    },
    {
      name: 'model-must-be-pure',
      comment:
        'The model/ folder is pure TypeScript business logic. No React, ' +
        'no React Native, no navigation. That is what makes it testable in ' +
        'milliseconds without rendering anything.',
      severity: 'error',
      from: {path: '^src/features/[^/]+/model'},
      to: {path: 'node_modules/(react|react-native|@react-navigation)'},
    },
    {
      name: 'shared-cannot-know-features',
      comment:
        'shared/ and core/ are the lower layers. If they import a feature, the ' +
        'dependency graph becomes cyclic and the modules can no longer be split apart.',
      severity: 'error',
      from: {path: '^src/(shared|core)'},
      to: {path: '^src/features'},
    },
    {
      name: 'features-cannot-know-app',
      comment:
        'app/ is the composition root — it knows every feature. The reverse is ' +
        'not allowed: a feature must not know that app/ exists.',
      severity: 'error',
      from: {path: '^src/features'},
      to: {path: '^src/app'},
    },
    {
      name: 'no-circular',
      comment: 'A circular import is almost always a sign the boundary was drawn in the wrong place.',
      severity: 'error',
      from: {},
      to: {circular: true},
    },
    {
      name: 'no-orphans',
      comment: 'A file nobody imports — usually dead code left over from a refactor.',
      severity: 'warn',
      from: {orphan: true, pathNot: ['\\.d\\.ts$', '^src/app/App\\.tsx$']},
      to: {},
    },
  ],
  options: {
    doNotFollow: {path: 'node_modules'},
    exclude: {path: '(__tests__|\\.test\\.tsx?$)'},
    tsConfig: {fileName: 'tsconfig.json'},
    tsPreCompilationDeps: true,
  },
};
