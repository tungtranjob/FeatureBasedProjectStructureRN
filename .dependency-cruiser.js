/**
 * RANH GIỚI KIẾN TRÚC — ÉP BẰNG MÁY, KHÔNG BẰNG NIỀM TIN.
 *
 * Đây là file quan trọng nhất của repo về mặt kiến trúc.
 * Không có nó, feature-first sẽ thoái hoá thành "thư mục đặt tên đẹp"
 * chỉ sau vài sprint, vì chẳng ai nhớ nổi luật khi đang vội.
 *
 * Chạy: npm run arch:check
 * Nên gắn vào pre-commit hook và CI.
 */
module.exports = {
  forbidden: [
    {
      name: 'no-cross-feature-internals',
      comment:
        'Feature A chỉ được import feature B qua public API (@features/b), ' +
        'KHÔNG được thò tay vào file nội bộ của B. Đây là luật số 1.',
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
        'Thư mục model/ là logic nghiệp vụ thuần TypeScript. Không React, ' +
        'không React Native, không navigation. Nhờ vậy nó test được trong ' +
        'mili-giây mà không cần render gì cả.',
      severity: 'error',
      from: {path: '^src/features/[^/]+/model'},
      to: {path: 'node_modules/(react|react-native|@react-navigation)'},
    },
    {
      name: 'shared-cannot-know-features',
      comment:
        'shared/ và core/ là tầng dưới. Nếu chúng import feature thì đồ thị ' +
        'phụ thuộc có chu trình và không thể tách module được nữa.',
      severity: 'error',
      from: {path: '^src/(shared|core)'},
      to: {path: '^src/features'},
    },
    {
      name: 'features-cannot-know-app',
      comment:
        'app/ là composition root — nó biết mọi feature. Chiều ngược lại ' +
        'thì không: feature không được biết app/ tồn tại.',
      severity: 'error',
      from: {path: '^src/features'},
      to: {path: '^src/app'},
    },
    {
      name: 'no-circular',
      comment: 'Import vòng gần như luôn là dấu hiệu ranh giới bị cắt sai chỗ.',
      severity: 'error',
      from: {},
      to: {circular: true},
    },
    {
      name: 'no-orphans',
      comment: 'File không ai import — thường là code chết sau refactor.',
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
