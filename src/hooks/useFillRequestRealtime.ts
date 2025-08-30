import type { FillRequestDTO, FormDetailResponse } from 'api/form';
import useAuth from 'hooks/useAuth';
import { useEffect, useRef } from 'react';
import { getSocket } from 'utils/socket';

type BulkStatePayload = {
  formId: string;
  requests: Array<{
    requestId: string;
    status?: string;
    completedSurvey?: number;
    surveyCount?: number;
    totalPrice?: number;
    // Thêm các trường queue
    queuePosition?: number;
    priority?: number;
    estimatedWaitTime?: number;
    queuedAt?: string;
    retryCount?: number;
  }>;
  updatedAt?: string;
};

type UpdatePayload = {
  formId: string;
  requestId: string;
  status?: string;
  completedSurvey?: number;
  surveyCount?: number;
  totalPrice?: number;
  // Thêm các trường queue
  queuePosition?: number;
  priority?: number;
  estimatedWaitTime?: number;
  queuedAt?: string;
  retryCount?: number;
  updatedAt?: string;
};

function mergeRequest(
  list: FillRequestDTO[] | undefined,
  update: { requestId: string; status?: string; completedSurvey?: number; surveyCount?: number; totalPrice?: number; queuePosition?: number; priority?: number; estimatedWaitTime?: number; queuedAt?: string; retryCount?: number }
): FillRequestDTO[] {
  const requests = Array.isArray(list) ? [...list] : [];
  const index = requests.findIndex((r) => r.id === update.requestId);
  if (index >= 0) {
    const prev = requests[index];
    requests[index] = {
      ...prev,
      status: update.status ?? prev.status,
      completedSurvey: update.completedSurvey ?? prev.completedSurvey,
      surveyCount: update.surveyCount ?? prev.surveyCount,
      totalPrice: update.totalPrice ?? prev.totalPrice,
      // Thêm các trường queue
      queuePosition: update.queuePosition ?? prev.queuePosition,
      priority: update.priority ?? prev.priority,
      estimatedWaitTime: update.estimatedWaitTime ?? prev.estimatedWaitTime,
      queuedAt: update.queuedAt ?? prev.queuedAt,
      retryCount: update.retryCount ?? prev.retryCount
    };
  } else {
    requests.unshift({
      id: update.requestId,
      status: update.status,
      completedSurvey: update.completedSurvey,
      surveyCount: update.surveyCount ?? 0,
      pricePerSurvey: 0,
      totalPrice: update.totalPrice,
      isHumanLike: false,
      // Thêm các trường queue
      queuePosition: update.queuePosition,
      priority: update.priority,
      estimatedWaitTime: update.estimatedWaitTime,
      queuedAt: update.queuedAt,
      retryCount: update.retryCount
    });
  }
  return requests;
}

export default function useFillRequestRealtime(
  selectedFormId: string | null,
  setSelectedForm: React.Dispatch<React.SetStateAction<FormDetailResponse | null>>
) {
  const { user } = useAuth();
  const currentFormRef = useRef<string | null>(null);
  const debounceTimerRef = useRef<number | null>(null);
  const pendingUpdatesRef = useRef<Map<string, UpdatePayload>>(new Map());
  const socketRef = useRef<any>(null);

  useEffect(() => {
    const socket = getSocket();
    socketRef.current = socket;
    
    // If no socket is available, skip realtime updates
    if (!socket) {
      console.log('⚠️ WebSocket not available, skipping realtime updates');
      return;
    }
    
    console.log('🔌 Socket Debug - useFillRequestRealtime:', {
      selectedFormId,
      userId: user?.id,
      socketConnected: socket.connected,
      currentFormRef: currentFormRef.current
    });

    const flushPending = () => {
      if (pendingUpdatesRef.current.size === 0) return;
      const updates = Array.from(pendingUpdatesRef.current.values());
      console.log('🔄 Flushing pending updates:', updates);
      pendingUpdatesRef.current.clear();
      setSelectedForm((prev) => {
        if (!prev || !currentFormRef.current || prev.id !== currentFormRef.current) return prev;
        const next: FormDetailResponse = { ...prev, fillRequests: [...(prev.fillRequests || [])] };
        updates.forEach((u) => {
          next.fillRequests = mergeRequest(next.fillRequests, u);
        });
        console.log('✅ Updated form with pending updates:', next.fillRequests?.length);
        return next;
      });
    };

    const scheduleFlush = () => {
      if (debounceTimerRef.current) window.clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = window.setTimeout(flushPending, 200);
    };

    const handleBulk = (payload: BulkStatePayload) => {
      console.log('📦 Received bulk state:', payload);
      if (!payload?.formId || payload.formId !== currentFormRef.current) {
        console.log('❌ Bulk state ignored - formId mismatch:', {
          payloadFormId: payload?.formId,
          currentFormId: currentFormRef.current
        });
        return;
      }
      setSelectedForm((prev) => {
        if (!prev || prev.id !== payload.formId) return prev;
        const next: FormDetailResponse = { ...prev, fillRequests: [...(prev.fillRequests || [])] };
        payload.requests.forEach((r) => {
          next.fillRequests = mergeRequest(next.fillRequests, r);
        });
        console.log('✅ Updated form with bulk state:', next.fillRequests?.length);
        return next;
      });
    };

    const handleUpdate = (payload: UpdatePayload) => {
      console.log('🔄 Received fill_request_update:', payload);
      if (!payload?.formId || payload.formId !== currentFormRef.current) {
        console.log('❌ Update ignored - formId mismatch:', {
          payloadFormId: payload?.formId,
          currentFormId: currentFormRef.current
        });
        return;
      }
      // Update immediately using values from backend (no accumulation)
      setSelectedForm((prev) => {
        if (!prev || !currentFormRef.current || prev.id !== currentFormRef.current) return prev;
        const next: FormDetailResponse = { ...prev, fillRequests: [...(prev.fillRequests || [])] };
        const index = next.fillRequests.findIndex((r) => r.id === payload.requestId);
        if (index >= 0) {
          const current = next.fillRequests[index];
          next.fillRequests[index] = {
            ...current,
            ...(payload.status !== undefined && { status: payload.status }),
            ...(payload.completedSurvey !== undefined && { completedSurvey: payload.completedSurvey }),
            ...(payload.surveyCount !== undefined && { surveyCount: payload.surveyCount }),
            ...(payload.totalPrice !== undefined && { totalPrice: payload.totalPrice }),
            // Thêm các trường queue
            ...(payload.queuePosition !== undefined && { queuePosition: payload.queuePosition }),
            ...(payload.priority !== undefined && { priority: payload.priority }),
            ...(payload.estimatedWaitTime !== undefined && { estimatedWaitTime: payload.estimatedWaitTime }),
            ...(payload.queuedAt !== undefined && { queuedAt: payload.queuedAt }),
            ...(payload.retryCount !== undefined && { retryCount: payload.retryCount })
          };
        } else {
          next.fillRequests.unshift({
            id: payload.requestId,
            status: payload.status,
            completedSurvey: payload.completedSurvey,
            surveyCount: payload.surveyCount ?? 0,
            pricePerSurvey: 0,
            totalPrice: payload.totalPrice,
            isHumanLike: false,
            // Thêm các trường queue
            queuePosition: payload.queuePosition,
            priority: payload.priority,
            estimatedWaitTime: payload.estimatedWaitTime,
            queuedAt: payload.queuedAt,
            retryCount: payload.retryCount
          });
        }
        console.log('✅ Request updated immediately:', {
          requestId: payload.requestId,
          status: payload.status,
          completedSurvey: payload.completedSurvey,
          surveyCount: payload.surveyCount,
          totalPrice: payload.totalPrice
        });
        return next;
      });
    };

    // Clean up previous listeners
    socket.off('fill_request_update');
    socket.off('fill_request_bulk_state');
    socket.off('request_update');
    socket.off('bulk_state');
    socket.off('update');
    socket.off('state');

    // Leave previous room if needed
    if (currentFormRef.current && currentFormRef.current !== selectedFormId) {
      console.log('🚪 Leaving previous room:', currentFormRef.current);
      socket.emit('leave_form_room', { formId: currentFormRef.current, userId: user?.id });
    }

    // Connect and join new room
    if (selectedFormId && user?.id) {
      if (!socket.connected) {
        console.log('🔌 Connecting socket...');
        socket.connect();
      }
      
      currentFormRef.current = selectedFormId;
      console.log('🚪 Joining room:', selectedFormId);
      
      // Register listeners BEFORE emitting join to avoid missing the first snapshot
      socket.on('fill_request_update', handleUpdate);
      socket.on('fill_request_bulk_state', handleBulk);
      
      // Also listen to alternative event names that might be used by BE
      socket.on('request_update', (data: any) => {
        console.log('🔄 Alternative request_update received:', data);
        if (data && typeof data === 'object') {
          handleUpdate(data as UpdatePayload);
        }
      });
      
      socket.on('bulk_state', (data: any) => {
        console.log('📦 Alternative bulk_state received:', data);
        if (data && typeof data === 'object') {
          handleBulk(data as BulkStatePayload);
        }
      });
      
      // Listen to generic events in case BE uses different naming
      socket.on('update', (data: any) => {
        console.log('🔄 Generic update event received:', data);
        if (data && typeof data === 'object' && data.formId && data.requestId) {
          handleUpdate(data as UpdatePayload);
        }
      });
      
      socket.on('state', (data: any) => {
        console.log('📦 Generic state event received:', data);
        if (data && typeof data === 'object' && data.formId && Array.isArray(data.requests)) {
          handleBulk(data as BulkStatePayload);
        }
      });
      
      // Emit join after setting up listeners
      socket.emit('join_form_room', { formId: selectedFormId, userId: user.id });
      
      // Debug: Check if join was successful
      setTimeout(() => {
        console.log('🔍 Socket state after join:', {
          connected: socket.connected,
          id: socket.id,
          currentFormRef: currentFormRef.current
        });
      }, 1000);
    }

    return () => {
      console.log('🧹 Cleaning up socket listeners');
      if (debounceTimerRef.current) window.clearTimeout(debounceTimerRef.current);
      
      // Remove all listeners
      socket.off('fill_request_update');
      socket.off('fill_request_bulk_state');
      socket.off('request_update');
      socket.off('bulk_state');
      socket.off('update');
      socket.off('state');
      
      if (currentFormRef.current) {
        socket.emit('leave_form_room', { formId: currentFormRef.current, userId: user?.id });
      }
      
      pendingUpdatesRef.current.clear();
      currentFormRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFormId, setSelectedForm, user?.id]);
}


