/**
 * RTK Query layer for the MVP2 workspace. Screens use these hooks only; the data source is `workspaceService`
 * (mock in Phase 1, HTTP in Phase 3). Cache tags are scoped per business id, so switching business never shows
 * another business's cached data and every mutation refreshes exactly what it affects.
 */
import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import type {
  Activity, Actor, Business, BusinessRole, Client, ClientInput, ConvertLeadInput, CreatedInvitation,
  DashboardSummary, Invitation, InvitationPreview, Lead, LeadInput, ListQuery, Member, Page, PipelineStage,
  ServiceError,
} from '../model/types.ts';
import { workspaceService } from '../services/index.ts';
import type { CreateBusinessInput, UpdateBusinessInput } from '../services/workspaceService.ts';

interface AuthSlice { auth: { currentUser: { id: string; email: string; name: string } } }

function actorFrom(getState: () => unknown): Actor {
  const user = (getState() as AuthSlice).auth.currentUser;
  return { id: user.id, email: user.email, name: user.name };
}

function toError(error: unknown): ServiceError {
  if (error && typeof error === 'object' && 'status' in error && 'message' in error) {
    return error as ServiceError;
  }
  return { status: 500, message: 'Something went wrong. Please try again.' };
}

async function call<T>(fn: () => Promise<T>): Promise<{ data: T } | { error: ServiceError }> {
  try {
    return { data: await fn() };
  } catch (error) {
    return { error: toError(error) };
  }
}

const tag = <T extends string>(type: T, businessId: string, id = 'LIST') => ({ type, id: `${businessId}:${id}` });

export const workspaceApi = createApi({
  reducerPath: 'workspaceApi',
  baseQuery: fakeBaseQuery<ServiceError>(),
  tagTypes: ['Business', 'Member', 'Invitation', 'Client', 'Lead', 'Dashboard', 'Activity'],
  endpoints: build => ({
    // Businesses -----------------------------------------------------------------------------
    myBusinesses: build.query<Business[], void>({
      queryFn: (_arg, api) => call(() => workspaceService.listMyBusinesses(actorFrom(api.getState))),
      providesTags: [{ type: 'Business', id: 'MINE' }],
    }),
    business: build.query<Business, string>({
      queryFn: (businessId, api) => call(() => workspaceService.getBusiness(actorFrom(api.getState), businessId)),
      providesTags: (_r, _e, businessId) => [tag('Business', businessId, 'ONE')],
    }),
    createBusiness: build.mutation<Business, CreateBusinessInput>({
      queryFn: (input, api) => call(() => workspaceService.createBusiness(actorFrom(api.getState), input)),
      invalidatesTags: [{ type: 'Business', id: 'MINE' }],
    }),
    updateBusiness: build.mutation<Business, { businessId: string; input: UpdateBusinessInput }>({
      queryFn: ({ businessId, input }, api) =>
        call(() => workspaceService.updateBusiness(actorFrom(api.getState), businessId, input)),
      invalidatesTags: (_r, _e, { businessId }) => [{ type: 'Business', id: 'MINE' }, tag('Business', businessId, 'ONE'),
        tag('Activity', businessId), tag('Dashboard', businessId)],
    }),

    // Members & invitations --------------------------------------------------------------------
    members: build.query<Member[], string>({
      queryFn: (businessId, api) => call(() => workspaceService.listMembers(actorFrom(api.getState), businessId)),
      providesTags: (_r, _e, businessId) => [tag('Member', businessId)],
    }),
    changeMemberRole: build.mutation<Member, { businessId: string; userId: string; role: BusinessRole }>({
      queryFn: ({ businessId, userId, role }, api) =>
        call(() => workspaceService.changeMemberRole(actorFrom(api.getState), businessId, userId, role)),
      invalidatesTags: (_r, _e, { businessId }) => [tag('Member', businessId), tag('Activity', businessId),
        tag('Dashboard', businessId), { type: 'Business', id: 'MINE' }, tag('Business', businessId, 'ONE')],
    }),
    removeMember: build.mutation<void, { businessId: string; userId: string }>({
      queryFn: ({ businessId, userId }, api) =>
        call(() => workspaceService.removeMember(actorFrom(api.getState), businessId, userId)),
      invalidatesTags: (_r, _e, { businessId }) => [tag('Member', businessId), tag('Activity', businessId),
        tag('Dashboard', businessId), { type: 'Business', id: 'MINE' }],
    }),
    transferOwnership: build.mutation<Member, { businessId: string; userId: string }>({
      queryFn: ({ businessId, userId }, api) =>
        call(() => workspaceService.transferOwnership(actorFrom(api.getState), businessId, userId)),
      invalidatesTags: (_r, _e, { businessId }) => [tag('Member', businessId), tag('Activity', businessId),
        { type: 'Business', id: 'MINE' }, tag('Business', businessId, 'ONE')],
    }),
    invitations: build.query<Invitation[], string>({
      queryFn: (businessId, api) => call(() => workspaceService.listInvitations(actorFrom(api.getState), businessId)),
      providesTags: (_r, _e, businessId) => [tag('Invitation', businessId)],
    }),
    inviteMember: build.mutation<CreatedInvitation, { businessId: string; email: string; role: Exclude<BusinessRole, 'OWNER'> }>({
      queryFn: ({ businessId, email, role }, api) =>
        call(() => workspaceService.inviteMember(actorFrom(api.getState), businessId, email, role)),
      invalidatesTags: (_r, _e, { businessId }) => [tag('Invitation', businessId), tag('Activity', businessId),
        tag('Dashboard', businessId)],
    }),
    revokeInvitation: build.mutation<void, { businessId: string; invitationId: string }>({
      queryFn: ({ businessId, invitationId }, api) =>
        call(() => workspaceService.revokeInvitation(actorFrom(api.getState), businessId, invitationId)),
      invalidatesTags: (_r, _e, { businessId }) => [tag('Invitation', businessId), tag('Activity', businessId),
        tag('Dashboard', businessId)],
    }),
    invitationPreview: build.query<InvitationPreview, string>({
      queryFn: (token, api) => call(() => workspaceService.previewInvitation(actorFrom(api.getState), token)),
    }),
    acceptInvitation: build.mutation<Business, string>({
      queryFn: (token, api) => call(() => workspaceService.acceptInvitation(actorFrom(api.getState), token)),
      invalidatesTags: [{ type: 'Business', id: 'MINE' }],
    }),
    declineInvitation: build.mutation<void, string>({
      queryFn: (token, api) => call(() => workspaceService.declineInvitation(actorFrom(api.getState), token)),
    }),

    // Clients ------------------------------------------------------------------------------------
    clients: build.query<Page<Client>, { businessId: string; query: ListQuery }>({
      queryFn: ({ businessId, query }, api) =>
        call(() => workspaceService.listClients(actorFrom(api.getState), businessId, query)),
      providesTags: (_r, _e, { businessId }) => [tag('Client', businessId)],
    }),
    client: build.query<Client, { businessId: string; clientId: string }>({
      queryFn: ({ businessId, clientId }, api) =>
        call(() => workspaceService.getClient(actorFrom(api.getState), businessId, clientId)),
      providesTags: (_r, _e, { businessId, clientId }) => [tag('Client', businessId, clientId)],
    }),
    createClient: build.mutation<Client, { businessId: string; input: ClientInput }>({
      queryFn: ({ businessId, input }, api) =>
        call(() => workspaceService.createClient(actorFrom(api.getState), businessId, input)),
      invalidatesTags: (_r, _e, { businessId }) => [tag('Client', businessId), tag('Dashboard', businessId),
        tag('Activity', businessId)],
    }),
    updateClient: build.mutation<Client, { businessId: string; clientId: string; input: ClientInput }>({
      queryFn: ({ businessId, clientId, input }, api) =>
        call(() => workspaceService.updateClient(actorFrom(api.getState), businessId, clientId, input)),
      invalidatesTags: (_r, _e, { businessId, clientId }) => [tag('Client', businessId), tag('Client', businessId, clientId),
        tag('Dashboard', businessId), tag('Activity', businessId)],
    }),

    // Leads --------------------------------------------------------------------------------------
    leads: build.query<Page<Lead>, { businessId: string; query: ListQuery }>({
      queryFn: ({ businessId, query }, api) =>
        call(() => workspaceService.listLeads(actorFrom(api.getState), businessId, query)),
      providesTags: (_r, _e, { businessId }) => [tag('Lead', businessId)],
    }),
    lead: build.query<Lead, { businessId: string; leadId: string }>({
      queryFn: ({ businessId, leadId }, api) =>
        call(() => workspaceService.getLead(actorFrom(api.getState), businessId, leadId)),
      providesTags: (_r, _e, { businessId, leadId }) => [tag('Lead', businessId, leadId)],
    }),
    createLead: build.mutation<Lead, { businessId: string; input: LeadInput }>({
      queryFn: ({ businessId, input }, api) =>
        call(() => workspaceService.createLead(actorFrom(api.getState), businessId, input)),
      invalidatesTags: (_r, _e, { businessId }) => [tag('Lead', businessId), tag('Dashboard', businessId),
        tag('Activity', businessId)],
    }),
    updateLead: build.mutation<Lead, { businessId: string; leadId: string; input: LeadInput }>({
      queryFn: ({ businessId, leadId, input }, api) =>
        call(() => workspaceService.updateLead(actorFrom(api.getState), businessId, leadId, input)),
      invalidatesTags: (_r, _e, { businessId, leadId }) => [tag('Lead', businessId), tag('Lead', businessId, leadId),
        tag('Dashboard', businessId), tag('Activity', businessId)],
    }),
    changeLeadStage: build.mutation<Lead, { businessId: string; leadId: string; stage: PipelineStage }>({
      queryFn: ({ businessId, leadId, stage }, api) =>
        call(() => workspaceService.changeLeadStage(actorFrom(api.getState), businessId, leadId, stage)),
      invalidatesTags: (_r, _e, { businessId, leadId }) => [tag('Lead', businessId), tag('Lead', businessId, leadId),
        tag('Dashboard', businessId), tag('Activity', businessId)],
    }),
    deleteLead: build.mutation<void, { businessId: string; leadId: string }>({
      queryFn: ({ businessId, leadId }, api) =>
        call(() => workspaceService.deleteLead(actorFrom(api.getState), businessId, leadId)),
      invalidatesTags: (_r, _e, { businessId }) => [tag('Lead', businessId), tag('Dashboard', businessId),
        tag('Activity', businessId)],
    }),
    convertLead: build.mutation<Client, { businessId: string; leadId: string; input: ConvertLeadInput }>({
      queryFn: ({ businessId, leadId, input }, api) =>
        call(() => workspaceService.convertLead(actorFrom(api.getState), businessId, leadId, input)),
      invalidatesTags: (_r, _e, { businessId, leadId }) => [tag('Lead', businessId), tag('Lead', businessId, leadId),
        tag('Client', businessId), tag('Dashboard', businessId), tag('Activity', businessId)],
    }),

    // Command Centre -------------------------------------------------------------------------------
    dashboard: build.query<DashboardSummary, string>({
      queryFn: (businessId, api) => call(() => workspaceService.getDashboard(actorFrom(api.getState), businessId)),
      providesTags: (_r, _e, businessId) => [tag('Dashboard', businessId)],
    }),
    activity: build.query<Activity[], string>({
      queryFn: (businessId, api) => call(() => workspaceService.listActivity(actorFrom(api.getState), businessId)),
      providesTags: (_r, _e, businessId) => [tag('Activity', businessId)],
    }),
  }),
});

export const {
  useMyBusinessesQuery, useBusinessQuery, useCreateBusinessMutation, useUpdateBusinessMutation,
  useMembersQuery, useChangeMemberRoleMutation, useRemoveMemberMutation, useTransferOwnershipMutation,
  useInvitationsQuery, useInviteMemberMutation, useRevokeInvitationMutation, useInvitationPreviewQuery,
  useAcceptInvitationMutation, useDeclineInvitationMutation,
  useClientsQuery, useClientQuery, useCreateClientMutation, useUpdateClientMutation,
  useLeadsQuery, useLeadQuery, useCreateLeadMutation, useUpdateLeadMutation, useChangeLeadStageMutation,
  useDeleteLeadMutation, useConvertLeadMutation,
  useDashboardQuery, useActivityQuery,
} = workspaceApi;

/** Human-readable message from an RTK Query error. */
export function errorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (error && typeof error === 'object' && 'message' in error && typeof (error as ServiceError).message === 'string') {
    return (error as ServiceError).message;
  }
  return fallback;
}

export function fieldErrors(error: unknown): Record<string, string> {
  return (error && typeof error === 'object' && 'fieldErrors' in error
    ? (error as ServiceError).fieldErrors : undefined) ?? {};
}

export function errorStatus(error: unknown): number | undefined {
  return error && typeof error === 'object' && 'status' in error ? (error as ServiceError).status : undefined;
}
