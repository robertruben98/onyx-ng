// Stylelint config that enforces the design-token rules from CLAUDE.md §3:
//  - no raw color / size / radius values in component SCSS (strict-value)
//  - no direct use of *primitive* tokens; only semantic/component tokens
module.exports = {
  customSyntax: 'postcss-scss',
  plugins: ['stylelint-declaration-strict-value'],
  rules: {
    // Forbid raw values: color/size/radius properties must use a var()/function.
    'scale-unlimited/declaration-strict-value': [
      [
        '/color/',
        'fill',
        'stroke',
        'box-shadow',
        '/^background/',
        '/^border/',
        '/^padding/',
        '/^margin/',
        'gap',
        'width',
        'height',
        'font-size',
        'font-weight'
      ],
      {
        ignoreValues: [
          'transparent',
          'currentColor',
          'inherit',
          'initial',
          'unset',
          'none',
          'auto',
          'solid',
          '0'
        ],
        disableFix: true,
        message:
          'Usa un design token (var(--ui-...)); no se permiten valores crudos en SCSS de componentes.'
      }
    ],
    // Forbid referencing *primitive* tokens directly from a component.
    'declaration-property-value-disallowed-list': [
      {
        '/.*/': [
          '/var\\(\\s*--ui-(?:blue|slate|white|black|space|size|font-size|font-weight|border-width|radius-(?:sm|md|lg|full))\\b/'
        ]
      },
      {
        message:
          'No referencies tokens primitivos en componentes; usa tokens semánticos o de componente.'
      }
    ]
  }
};
