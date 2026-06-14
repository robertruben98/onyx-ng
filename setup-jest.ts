import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone';
import { toHaveNoViolations } from 'jest-axe';
import '@testing-library/jest-dom';

setupZoneTestEnv();
expect.extend(toHaveNoViolations);
