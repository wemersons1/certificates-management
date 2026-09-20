import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";
import api from "../lib/api";
import { toast } from "react-toastify";

interface JobStatus {
  status: 'idle' | 'running' | 'done' | 'failed' | 'error';
  jobId: string | null;
}

interface JobMonitorContextType {
  monitorJobStatus: (jobId: string, onFinish: () => void) => void;
  jobStatus: JobStatus;
  setJobStatusDirectly: (status: JobStatus) => void;
}

const JobMonitorContext = createContext<JobMonitorContextType | undefined>(undefined);

interface Props {
  children: ReactNode;
}

export const JobMonitorProvider: React.FC<Props> = ({ children }) => {
    const [jobStatus, setJobStatus] = useState<JobStatus>({ status: 'idle', jobId: null });
  
    const setJobStatusDirectly = useCallback((status: JobStatus) => {
      setJobStatus(status);
    }, []);

  const monitorJobStatus = useCallback((jobId: string, onFinish: () => void) => { 
    setJobStatus({ status: 'running', jobId });
    const toastId = toast.loading("Sincronizando campanhas e anúncios...", {
      position: "bottom-right"
    });

    const intervalId = setInterval(async () => {
      try {
        const response = await api.get(`/job-status/${jobId}`);
        const { status } = response.data;
        if (status === 'done') {
          clearInterval(intervalId);
          setJobStatus({ status: 'done', jobId });
          toast.update(toastId, { render: "Campanhas e anúncios sincronizados com sucesso!", type: "success", isLoading: false, autoClose: 5000 });
          onFinish();
        } else if (status === 'failed') {
          clearInterval(intervalId);
          setJobStatus({ status: 'failed', jobId });
          toast.update(toastId, { render: "Falha na sincronização das campanhas.", type: "error", isLoading: false, autoClose: 5000 });
          onFinish();
        }
      } catch (error) {
        clearInterval(intervalId);
        setJobStatus({ status: 'error', jobId });
        toast.update(toastId, { render: "Erro ao verificar o status do job.", type: "error", isLoading: false, autoClose: 5000 });
        onFinish(); 
      }
    }, 5000);
  }, []);

  return (
    <JobMonitorContext.Provider value={{ jobStatus, monitorJobStatus, setJobStatusDirectly  }}>
      {children}
    </JobMonitorContext.Provider>
  );
};

export const useJobMonitor = () => {
  const context = useContext(JobMonitorContext);
  if (!context) {
    throw new Error("useJobMonitor must be used within a JobMonitorProvider");
  }
  return context;
};
