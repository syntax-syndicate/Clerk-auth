import { camelToSnake, deprecated, snakeToCamel } from '@clerk/shared';
import type { OrganizationResource, UserResource } from '@clerk/types';
import React, { useMemo } from 'react';

import { SIGN_IN_INITIAL_VALUE_KEYS, SIGN_UP_INITIAL_VALUE_KEYS } from '../../core/constants';
import {
  buildAuthQueryString,
  buildURL,
  createDynamicParamParser,
  isAllowedRedirectOrigin,
  pickUrl,
} from '../../utils';
import { useCoreClerk, useEnvironment, useOptions } from '../contexts';
import type { NavbarRoute } from '../elements';
import type { ParsedQs } from '../router';
import { useRouter } from '../router';
import type {
  AvailableComponentCtx,
  CreateOrganizationCtx,
  OrganizationListCtx,
  OrganizationProfileCtx,
  OrganizationSwitcherCtx,
  SignInCtx,
  SignUpCtx,
  UserButtonCtx,
  UserProfileCtx,
} from '../types';
import type { CustomPageContent } from '../utils';
import { createOrganizationProfileCustomPages, createUserProfileCustomPages } from '../utils';

const populateParamFromObject = createDynamicParamParser({ regex: /:(\w+)/ });

export const ComponentContext = React.createContext<AvailableComponentCtx | null>(null);

const getInitialValuesFromQueryParams = (queryString: string, params: string[]) => {
  const props: Record<string, string> = {};
  const searchParams = new URLSearchParams(queryString);
  searchParams.forEach((value, key) => {
    if (params.includes(key) && typeof value === 'string') {
      props[snakeToCamel(key)] = value;
    }
  });

  return props;
};

export type SignUpContextType = SignUpCtx & {
  navigateAfterSignUp: () => any;
  queryParams: ParsedQs;
  signInUrl: string;
  secondFactorUrl: string;
  authQueryString: string | null;
};

export const useSignUpContext = (): SignUpContextType => {
  const { componentName, ...ctx } = (React.useContext(ComponentContext) || {}) as SignUpCtx;
  const { navigate } = useRouter();
  const { displayConfig } = useEnvironment();
  const { queryParams, queryString } = useRouter();
  const options = useOptions();
  const clerk = useCoreClerk();

  const initialValuesFromQueryParams = useMemo(
    () => getInitialValuesFromQueryParams(queryString, SIGN_UP_INITIAL_VALUE_KEYS),
    [],
  );

  if (componentName !== 'SignUp') {
    throw new Error('Clerk: useSignUpContext called outside of the mounted SignUp component.');
  }

  const afterSignUpUrl = clerk.buildUrlWithAuth(
    pickUrl(
      ['afterSignUpUrl', 'redirectUrl'],
      [
        {
          from: queryParams,
          options: {
            validator: url => isAllowedRedirectOrigin(url, options.allowedRedirectOrigins),
            formatter: camelToSnake,
          },
        },
        {
          from: [ctx, options, displayConfig],
        },
      ],
    ),
  );

  const afterSignInUrl = clerk.buildUrlWithAuth(
    pickUrl(
      ['afterSignInUrl', 'redirectUrl'],
      [
        {
          from: queryParams,
          options: {
            validator: url => isAllowedRedirectOrigin(url, options.allowedRedirectOrigins),
            formatter: camelToSnake,
          },
        },
        {
          from: [ctx, options, displayConfig],
        },
      ],
    ),
  );

  const navigateAfterSignUp = () => navigate(afterSignUpUrl);

  let signInUrl = pickUrl('signInUrl', { from: [ctx, options, displayConfig] });

  // Add query strings to the sign in URL
  const authQs = buildAuthQueryString({
    afterSignInUrl: afterSignInUrl,
    afterSignUpUrl: afterSignUpUrl,
    displayConfig: displayConfig,
  });

  // Todo: Look for a better way than checking virtual
  if (authQs && ctx.routing != 'virtual') {
    signInUrl += `#/?${authQs}`;
  }

  // TODO: Avoid building this url again to remove duplicate code. Get it from window.Clerk instead.
  const secondFactorUrl = buildURL({ base: signInUrl, hashPath: '/factor-two' }, { stringify: true });

  return {
    ...ctx,
    componentName,
    signInUrl,
    secondFactorUrl,
    afterSignUpUrl,
    afterSignInUrl,
    navigateAfterSignUp,
    queryParams,
    initialValues: { ...ctx.initialValues, ...initialValuesFromQueryParams },
    authQueryString: authQs,
  };
};

export type SignInContextType = SignInCtx & {
  navigateAfterSignIn: () => any;
  queryParams: ParsedQs;
  signUpUrl: string;
  signUpContinueUrl: string;
  authQueryString: string | null;
};

export const useSignInContext = (): SignInContextType => {
  const { componentName, ...ctx } = (React.useContext(ComponentContext) || {}) as SignInCtx;
  const { navigate } = useRouter();
  const { displayConfig } = useEnvironment();
  const { queryParams, queryString } = useRouter();
  const options = useOptions();
  const clerk = useCoreClerk();

  const initialValuesFromQueryParams = useMemo(
    () => getInitialValuesFromQueryParams(queryString, SIGN_IN_INITIAL_VALUE_KEYS),
    [],
  );

  if (componentName !== 'SignIn') {
    throw new Error('Clerk: useSignInContext called outside of the mounted SignIn component.');
  }

  const afterSignUpUrl = clerk.buildUrlWithAuth(
    pickUrl(
      ['afterSignUpUrl', 'redirectUrl'],
      [
        {
          from: queryParams,
          options: {
            validator: url => isAllowedRedirectOrigin(url, options.allowedRedirectOrigins),
            formatter: camelToSnake,
          },
        },
        {
          from: [ctx, options, displayConfig],
        },
      ],
    ),
  );

  const afterSignInUrl = clerk.buildUrlWithAuth(
    pickUrl(
      ['afterSignInUrl', 'redirectUrl'],
      [
        {
          from: queryParams,
          options: {
            validator: url => isAllowedRedirectOrigin(url, options.allowedRedirectOrigins),
            formatter: camelToSnake,
          },
        },
        {
          from: [ctx, options, displayConfig],
        },
      ],
    ),
  );

  const navigateAfterSignIn = () => navigate(afterSignInUrl);

  let signUpUrl = pickUrl('signUpUrl', { from: [ctx, options, displayConfig] });

  // Add query strings to the sign in URL
  const authQs = buildAuthQueryString({
    afterSignInUrl: afterSignInUrl,
    afterSignUpUrl: afterSignUpUrl,
    displayConfig: displayConfig,
  });
  if (authQs && ctx.routing !== 'virtual') {
    signUpUrl += `#/?${authQs}`;
  }

  const signUpContinueUrl = buildURL({ base: signUpUrl, hashPath: '/continue' }, { stringify: true });

  return {
    ...ctx,
    componentName,
    signUpUrl,
    afterSignInUrl,
    afterSignUpUrl,
    navigateAfterSignIn,
    signUpContinueUrl,
    queryParams,
    initialValues: { ...ctx.initialValues, ...initialValuesFromQueryParams },
    authQueryString: authQs,
  };
};

type PagesType = {
  routes: NavbarRoute[];
  contents: CustomPageContent[];
  pageToRootNavbarRouteMap: Record<string, NavbarRoute>;
};

export type UserProfileContextType = UserProfileCtx & {
  queryParams: ParsedQs;
  authQueryString: string | null;
  pages: PagesType;
};

export const useUserProfileContext = (): UserProfileContextType => {
  const { componentName, customPages, ...ctx } = (React.useContext(ComponentContext) || {}) as UserProfileCtx;
  const { queryParams } = useRouter();

  if (componentName !== 'UserProfile') {
    throw new Error('Clerk: useUserProfileContext called outside of the mounted UserProfile component.');
  }

  const pages = createUserProfileCustomPages(customPages || []);

  return {
    ...ctx,
    pages,
    componentName,
    queryParams,
    authQueryString: '',
  };
};

export const useUserButtonContext = () => {
  const { componentName, ...ctx } = (React.useContext(ComponentContext) || {}) as UserButtonCtx;
  const Clerk = useCoreClerk();
  const { navigate } = useRouter();
  const { displayConfig } = useEnvironment();
  const options = useOptions();

  if (componentName !== 'UserButton') {
    throw new Error('Clerk: useUserButtonContext called outside of the mounted UserButton component.');
  }

  const signInUrl = pickUrl('signInUrl', { from: [ctx, options, displayConfig] });
  const userProfileUrl = pickUrl('userProfileUrl', { from: [ctx, displayConfig] });
  const afterMultiSessionSingleSignOutUrl = pickUrl(['afterMultiSessionSingleSignOutUrl', 'afterSignOutOneUrl'], {
    from: [ctx, displayConfig],
  });
  const afterSignOutUrl = pickUrl(['afterSignOutUrl', 'afterSignOutAllUrl'], { from: [ctx, displayConfig] });
  const afterSwitchSessionUrl = pickUrl(['afterSwitchSessionUrl', 'afterSignOutAllUrl'], {
    from: [ctx, displayConfig],
  });

  const navigateAfterMultiSessionSingleSignOut = () => Clerk.redirectWithAuth(afterMultiSessionSingleSignOutUrl);
  const navigateAfterSignOut = () => navigate(afterSignOutUrl);
  const navigateAfterSwitchSession = () => navigate(afterSwitchSessionUrl);

  return {
    ...ctx,
    componentName,
    navigateAfterMultiSessionSingleSignOut,
    navigateAfterSignOut,
    navigateAfterSwitchSession,
    signInUrl,
    userProfileUrl,
    afterMultiSessionSingleSignOutUrl,
    afterSignOutUrl,
    afterSwitchSessionUrl,
  };
};

export const useOrganizationSwitcherContext = () => {
  const { componentName, ...ctx } = (React.useContext(ComponentContext) || {}) as OrganizationSwitcherCtx;
  const { navigate } = useRouter();
  const { displayConfig } = useEnvironment();

  if (componentName !== 'OrganizationSwitcher') {
    throw new Error('Clerk: useOrganizationSwitcherContext called outside OrganizationSwitcher.');
  }

  const afterCreateOrganizationUrl = pickUrl('afterCreateOrganizationUrl', { from: [ctx, displayConfig] });
  const afterLeaveOrganizationUrl = pickUrl('afterLeaveOrganizationUrl', { from: [ctx, displayConfig] });
  const createOrganizationUrl = pickUrl('createOrganizationUrl', { from: [ctx, displayConfig] });
  const organizationProfileUrl = pickUrl('organizationProfileUrl', { from: [ctx, displayConfig] });

  const navigateCreateOrganization = () => navigate(createOrganizationUrl);
  const navigateOrganizationProfile = () => navigate(organizationProfileUrl);

  const navigateAfterSelectOrganizationOrPersonal = ({
    organization,
    user,
  }: {
    organization?: OrganizationResource;
    user?: UserResource;
  }) => {
    if (typeof ctx.afterSelectPersonalUrl === 'function' && user) {
      return navigate(ctx.afterSelectPersonalUrl(user));
    }

    if (typeof ctx.afterSelectOrganizationUrl === 'function' && organization) {
      return navigate(ctx.afterSelectOrganizationUrl(organization));
    }

    if (ctx.afterSelectPersonalUrl && user) {
      const parsedUrl = populateParamFromObject({
        urlWithParam: ctx.afterSelectPersonalUrl as string,
        entity: user,
      });
      return navigate(parsedUrl);
    }

    if (ctx.afterSelectOrganizationUrl && organization) {
      const parsedUrl = populateParamFromObject({
        urlWithParam: ctx.afterSelectOrganizationUrl as string,
        entity: organization,
      });
      return navigate(parsedUrl);
    }

    // Continue to support afterSwitchOrganizationUrl
    if (ctx.afterSwitchOrganizationUrl) {
      deprecated('afterSwitchOrganizationUrl', 'Use `afterSelectOrganizationUrl` or `afterSelectPersonalUrl`');
      return navigate(ctx.afterSwitchOrganizationUrl);
    }

    return Promise.resolve();
  };

  const navigateAfterSelectOrganization = (organization: OrganizationResource) =>
    navigateAfterSelectOrganizationOrPersonal({ organization });

  const navigateAfterSelectPersonal = (user: UserResource) => navigateAfterSelectOrganizationOrPersonal({ user });

  return {
    ...ctx,
    hidePersonal: ctx.hidePersonal || false,
    organizationProfileMode: ctx.organizationProfileMode || 'modal',
    createOrganizationMode: ctx.createOrganizationMode || 'modal',
    afterCreateOrganizationUrl,
    afterLeaveOrganizationUrl,
    navigateOrganizationProfile,
    navigateCreateOrganization,
    navigateAfterSelectOrganization,
    navigateAfterSelectPersonal,
    componentName,
  };
};

export const useOrganizationListContext = () => {
  const { componentName, ...ctx } = (React.useContext(ComponentContext) || {}) as unknown as OrganizationListCtx;
  const { navigate } = useRouter();
  const { displayConfig } = useEnvironment();

  if (componentName !== 'OrganizationList') {
    throw new Error('Clerk: useOrganizationListContext called outside OrganizationList.');
  }

  const afterCreateOrganizationUrl = ctx.afterCreateOrganizationUrl || displayConfig.afterCreateOrganizationUrl;

  const navigateAfterCreateOrganization = (organization: OrganizationResource) => {
    if (typeof ctx.afterCreateOrganizationUrl === 'function') {
      return navigate(ctx.afterCreateOrganizationUrl(organization));
    }

    if (ctx.afterCreateOrganizationUrl) {
      const parsedUrl = populateParamFromObject({
        urlWithParam: ctx.afterCreateOrganizationUrl,
        entity: organization,
      });
      return navigate(parsedUrl);
    }

    return navigate(displayConfig.afterCreateOrganizationUrl);
  };

  const navigateAfterSelectOrganizationOrPersonal = ({
    organization,
    user,
  }: {
    organization?: OrganizationResource;
    user?: UserResource;
  }) => {
    if (typeof ctx.afterSelectPersonalUrl === 'function' && user) {
      return navigate(ctx.afterSelectPersonalUrl(user));
    }

    if (typeof ctx.afterSelectOrganizationUrl === 'function' && organization) {
      return navigate(ctx.afterSelectOrganizationUrl(organization));
    }

    if (ctx.afterSelectPersonalUrl && user) {
      const parsedUrl = populateParamFromObject({
        urlWithParam: ctx.afterSelectPersonalUrl as string,
        entity: user,
      });
      return navigate(parsedUrl);
    }

    if (ctx.afterSelectOrganizationUrl && organization) {
      const parsedUrl = populateParamFromObject({
        urlWithParam: ctx.afterSelectOrganizationUrl as string,
        entity: organization,
      });
      return navigate(parsedUrl);
    }

    return Promise.resolve();
  };

  const navigateAfterSelectOrganization = (organization: OrganizationResource) =>
    navigateAfterSelectOrganizationOrPersonal({ organization });
  const navigateAfterSelectPersonal = (user: UserResource) => navigateAfterSelectOrganizationOrPersonal({ user });

  return {
    ...ctx,
    afterCreateOrganizationUrl,
    skipInvitationScreen: ctx.skipInvitationScreen || false,
    hidePersonal: ctx.hidePersonal || false,
    navigateAfterCreateOrganization,
    navigateAfterSelectOrganization,
    navigateAfterSelectPersonal,
    componentName,
  };
};

export type OrganizationProfileContextType = OrganizationProfileCtx & {
  pages: PagesType;
  navigateAfterLeaveOrganization: () => Promise<unknown>;
};

export const useOrganizationProfileContext = (): OrganizationProfileContextType => {
  const { componentName, customPages, ...ctx } = (React.useContext(ComponentContext) || {}) as OrganizationProfileCtx;
  const { navigate } = useRouter();
  const { displayConfig } = useEnvironment();

  if (componentName !== 'OrganizationProfile') {
    throw new Error('Clerk: useOrganizationProfileContext called outside OrganizationProfile.');
  }

  const pages = createOrganizationProfileCustomPages(customPages || []);

  const afterLeaveOrganizationUrl = pickUrl('afterLeaveOrganizationUrl', { from: [ctx, displayConfig] });
  const navigateAfterLeaveOrganization = () => navigate(afterLeaveOrganizationUrl);

  return {
    ...ctx,
    pages,
    navigateAfterLeaveOrganization,
    componentName,
  };
};

export const useCreateOrganizationContext = () => {
  const { componentName, ...ctx } = (React.useContext(ComponentContext) || {}) as CreateOrganizationCtx;
  const { navigate } = useRouter();
  const { displayConfig } = useEnvironment();

  if (componentName !== 'CreateOrganization') {
    throw new Error('Clerk: useCreateOrganizationContext called outside CreateOrganization.');
  }

  const navigateAfterCreateOrganization = (organization: OrganizationResource) => {
    if (typeof ctx.afterCreateOrganizationUrl === 'function') {
      return navigate(ctx.afterCreateOrganizationUrl(organization));
    }

    if (ctx.afterCreateOrganizationUrl) {
      const parsedUrl = populateParamFromObject({
        urlWithParam: ctx.afterCreateOrganizationUrl,
        entity: organization,
      });
      return navigate(parsedUrl);
    }

    return navigate(displayConfig.afterCreateOrganizationUrl);
  };

  return {
    ...ctx,
    skipInvitationScreen: ctx.skipInvitationScreen || false,
    navigateAfterCreateOrganization,
    componentName,
  };
};
