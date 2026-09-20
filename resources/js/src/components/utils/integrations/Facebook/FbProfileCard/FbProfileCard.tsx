import React from 'react';
import moment from "moment";
import { Accordion, Badge, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import api from '@/src/lib/api';

interface Account {
  id: number;
  ad_account_id_fb: string;
  name: string;
  account_status: number;
  status_control: number;
  profile_id: number;
  has_synced_campaigns: boolean;
}

interface Profile {
  id: number;
  name: string;
  created_at: string;
  token_expires_at: string; 
  active: boolean;
  accounts: Account[];
}

interface FbProfileCardProps {
  profiles: Profile[];
  onProfileDeleted: (id: number) => void;
  onEditToken: (profileId: number) => void;
  onToggleStatus: (account: Account) => void;
}

const getInitials = (name: string) => {
  const nameParts = name.split(' ');
  const initials = nameParts[0][0] + (nameParts.length > 1 ? nameParts[nameParts.length - 1][0] : '');
  return initials.toUpperCase();
};

const FbProfileCard: React.FC<FbProfileCardProps> = ({ profiles, onProfileDeleted, onEditToken, onToggleStatus }) => {

  const renderStatusBadge = (account_status: number) => {
    switch (account_status) {
      case 1:
        return <Badge bg="success-transparent">Ativa</Badge>;
      case 0:
        return <Badge bg="danger-transparent">Inativa</Badge>;
      default:
        return <Badge bg="warning-transparent">Desconhecido</Badge>;
    }
  };

  const renderIntegrationStatus = (hasSyncedCampaigns: boolean) => {
    return hasSyncedCampaigns ? (
      <Badge bg="success-transparent">Campanhas integradas</Badge>
    ) : (
      <Badge bg="danger-transparent">Campanhas não integradas</Badge>
    );
  };

  const calculateTokenExpiry = (expiresAt: string, profileId: number) => {
    const expiresDate = moment(expiresAt);
    const daysLeft = expiresDate.diff(moment(), 'days');
    if (daysLeft <= 0) {
      return (
        <>
          <Badge bg="danger-transparent" className="me-2">Token Expirado</Badge>
          <Button 
            variant="outline-primary" 
            size="sm" 
            onClick={(e) => {
              e.stopPropagation();
              onEditToken(profileId);
            }}
          >
            Editar Token
          </Button>
        </>
      );
    } else {
      return `Token expira em: ${daysLeft} dias`;
    }
  };

  const calculateConnectedTime = (createdAt: string) => {
    const now = moment();
    const created = moment(createdAt);
    const diffInMinutes = now.diff(created, 'minutes');
    
    if (diffInMinutes < 60) {
      return `Conectado há ${diffInMinutes} minutos`;
    }
    
    const diffInHours = now.diff(created, 'hours');
    
    if (diffInHours < 24) {
      return `Conectado há ${diffInHours} horas`;
    }
    
    const diffInDays = now.diff(created, 'days');
    return `Conectado há ${diffInDays} dias`;
  };

  const handleDeleteProfile = async (profileId: number) => {
    const confirmDelete = window.confirm("Você tem certeza que deseja excluir este perfil e todos os seus dados de anúncios?");
  
    if (!confirmDelete) {
      return; 
    }
    try {
      await api.delete(`/facebook/profile/${profileId}`);
      toast.success("Perfil excluído com sucesso!");
      onProfileDeleted(profileId);
    } catch (error) {
      toast.error("Erro ao excluir o perfil.");
    }
  };

  return (
    <Accordion className="accordion accordionicon-right accordions-items-separate">
      {profiles.map((profile, index) => (
        <Accordion.Item eventKey={index.toString()} key={index}>
          <Accordion.Header>
            <div className="d-flex align-items-center" style={{ width: '100%' }}>
              <div className="profile-image me-3">
                <div
                  style={{
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    backgroundColor: '#0B63E4',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    fontWeight: 'bold'
                  }}
                >
                  {getInitials(profile.name)}
                </div>
              </div>
              <div className="d-flex justify-content-between align-items-center w-100">
                <div className="me-3">
                  <h6 className="mb-0">{profile.name}</h6>
                  <small className="text-muted">{calculateConnectedTime(profile.created_at)}</small>
                </div>
                <div className="d-flex align-items-center">
                  <small className="text-muted me-5">
                    {calculateTokenExpiry(profile.token_expires_at, profile.id)}
                  </small>
                  <Button
                    variant="danger"
                    size="sm"
                    className="ms-2 me-5"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteProfile(profile.id);
                    }}
                  >
                    Excluir
                  </Button>
                </div>
              </div>
            </div>
          </Accordion.Header>
          <Accordion.Body className="p-2">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Ativar/Desativar</th>
                  <th>Conta de Anúncio</th>
                  <th>Status Facebook</th>
                  <th>Status Integração</th>
                </tr>
              </thead>
              <tbody>
                {profile.accounts.map((account) => (
                  <tr key={account.id}>
                    <td>
                      <div className="form-check form-switch" style={{ fontSize: '1.25rem' }}>
                        <input
                          type="checkbox"
                          className="form-check-input form-checked-primary"
                          role="switch"
                          id={`${account.id}_toggle`}
                          defaultChecked={account.status_control !== 0}
                          onChange={() => onToggleStatus(account)}
                          disabled={account.has_synced_campaigns}
                          style={{
                            width: '2rem',
                            height: '1rem',
                            cursor: 'pointer'
                          }}
                        />
                      </div>
                    </td>
                    <td>
                      <strong>{account.name}</strong>
                      <br />
                      <small className="text-muted">{account.ad_account_id_fb}</small>
                    </td>
                    <td>{renderStatusBadge(account.account_status)}</td>
                    <td>{renderIntegrationStatus(account.has_synced_campaigns)}</td> 
                  </tr>
                ))}
              </tbody>
            </table>
          </Accordion.Body>
        </Accordion.Item>
      ))}
    </Accordion>
  );
};

export default FbProfileCard;
