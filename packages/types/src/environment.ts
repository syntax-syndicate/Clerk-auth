import type { AuthConfigResource } from './authConfig';
import type { DisplayConfigResource } from './displayConfig';
import type { OrganizationSettingsResource } from './organizationSettings';
import type { ClerkResource } from './resource';
import type { EnvironmentJSONSnapshot } from './snapshots';
import type { UserSettingsResource } from './userSettings';

export interface EnvironmentResource extends ClerkResource {
  userSettings: UserSettingsResource;
  organizationSettings: OrganizationSettingsResource;
  authConfig: AuthConfigResource;
  displayConfig: DisplayConfigResource;
  isSingleSession: () => boolean;
  isProduction: () => boolean;
  isDevelopmentOrStaging: () => boolean;
  onWindowLocationHost: () => boolean;
  maintenanceMode: boolean;
  __internal_toSnapshot: () => EnvironmentJSONSnapshot;
}
