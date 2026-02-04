import React, { useState, useEffect } from 'react';
import { Modal } from '../shared/Modal';
import { Button } from '../shared/Button';
import { Input } from '../shared/Input';
import { Document, DocumentPermission } from '../../types/document';
import { STAGES, StageId } from '../../types/stage';
import { useDocuments } from '../../contexts/DocumentsContext';

interface PermissionsConfigProps {
  isOpen: boolean;
  onClose: () => void;
  document: Document | null;
}

interface StagePermission {
  stageId: StageId;
  enabled: boolean;
  delayDays: number;
  sendEmail: boolean;
}

export const PermissionsConfig: React.FC<PermissionsConfigProps> = ({
  isOpen,
  onClose,
  document,
}) => {
  const { getPermissions, setPermissions } = useDocuments();
  const [stagePermissions, setStagePermissions] = useState<StagePermission[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen && document) {
      loadPermissions();
    }
  }, [isOpen, document]);

  const loadPermissions = async () => {
    if (!document) return;

    setLoading(true);
    try {
      const existingPermissions = await getPermissions(document.id);
      
      // Initialize all stages with default values
      const initialPermissions: StagePermission[] = STAGES.map((stage) => {
        const existing = existingPermissions.find(p => p.requiredStage === stage.id);
        return {
          stageId: stage.id,
          enabled: !!existing,
          delayDays: existing?.delayDays || 0,
          sendEmail: !!existing?.emailTemplate,
        };
      });

      setStagePermissions(initialPermissions);
    } catch (error) {
      console.error('Error loading permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStage = (stageId: StageId) => {
    setStagePermissions((prev) =>
      prev.map((perm) =>
        perm.stageId === stageId
          ? { ...perm, enabled: !perm.enabled }
          : perm
      )
    );
  };

  const handleDelayChange = (stageId: StageId, delayDays: number) => {
    setStagePermissions((prev) =>
      prev.map((perm) =>
        perm.stageId === stageId
          ? { ...perm, delayDays: Math.max(0, delayDays) }
          : perm
      )
    );
  };

  const handleEmailToggle = (stageId: StageId) => {
    setStagePermissions((prev) =>
      prev.map((perm) =>
        perm.stageId === stageId
          ? { ...perm, sendEmail: !perm.sendEmail }
          : perm
      )
    );
  };

  const handleSave = async () => {
    if (!document) return;

    setSaving(true);
    try {
      // Build permissions array from enabled stages
      const permissionsToSave: Omit<DocumentPermission, 'id'>[] = stagePermissions
        .filter((perm) => perm.enabled)
        .map((perm) => ({
          documentId: document.id,
          requiredStage: perm.stageId,
          delayDays: perm.delayDays,
          emailTemplate: perm.sendEmail
            ? `Hi {{name}},\n\nWe've shared "${document.name}" with you. You can access it in your Data Room.\n\nBest regards,\nInvestiaFlow Team`
            : undefined,
        }));

      await setPermissions(document.id, permissionsToSave);
      onClose();
    } catch (error) {
      console.error('Error saving permissions:', error);
    } finally {
      setSaving(false);
    }
  };

  if (!document) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Configure Permissions - ${document.name}`}
      size="lg"
    >
      {loading ? (
        <div className="py-8 text-center">
          <p className="text-gray-500">Loading permissions...</p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-gray-600 mb-4">
            Share this document automatically when a lead reaches the selected stage.
          </p>

          <div className="space-y-3">
            {STAGES.map((stage) => {
              const permission = stagePermissions.find((p) => p.stageId === stage.id);
              if (!permission) return null;

              return (
                <div
                  key={stage.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={permission.enabled}
                        onChange={() => handleToggleStage(stage.id)}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <label className="flex items-center gap-2 cursor-pointer">
                        <span className="text-xl">{stage.emoji}</span>
                        <span className="font-medium text-gray-900">{stage.name}</span>
                      </label>
                    </div>
                  </div>

                  {permission.enabled && (
                    <div className="ml-6 space-y-3 pt-3 border-t border-gray-100">
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">
                          Delay (days after stage)
                        </label>
                        <Input
                          type="number"
                          min="0"
                          value={permission.delayDays}
                          onChange={(e) =>
                            handleDelayChange(stage.id, parseInt(e.target.value) || 0)
                          }
                          className="w-32"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {permission.delayDays === 0
                            ? 'Share immediately when lead reaches this stage'
                            : `Share ${permission.delayDays} day(s) after lead reaches this stage`}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={permission.sendEmail}
                          onChange={() => handleEmailToggle(stage.id)}
                          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <label className="text-sm text-gray-700 cursor-pointer">
                          Send email notification
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <Button type="button" variant="secondary" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="button" variant="primary" onClick={handleSave} isLoading={saving}>
              Save Permissions
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
