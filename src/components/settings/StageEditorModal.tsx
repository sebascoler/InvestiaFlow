import React, { useState } from 'react';
import { Modal } from '../shared/Modal';
import { Button } from '../shared/Button';
import { Stage } from '../../types/stage';

const AVAILABLE_COLORS = [
  { name: 'slate', label: 'Slate' },
  { name: 'gray', label: 'Gray' },
  { name: 'red', label: 'Red' },
  { name: 'orange', label: 'Orange' },
  { name: 'amber', label: 'Amber' },
  { name: 'yellow', label: 'Yellow' },
  { name: 'green', label: 'Green' },
  { name: 'cyan', label: 'Cyan' },
  { name: 'blue', label: 'Blue' },
  { name: 'purple', label: 'Purple' },
  { name: 'pink', label: 'Pink' },
];

const EMOJI_SUGGESTIONS = ['🎯', '📧', '💬', '📊', '🔍', '📝', '✅', '❌', '🚀', '💰', '🤝', '📌', '⭐', '🔥', '💎', '📋', '🎉', '⚡', '🏆', '💼'];

interface StageEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  stage: Stage;
  isNew: boolean;
  existingIds: string[];
  onSave: (stage: Stage) => void;
}

export const StageEditorModal: React.FC<StageEditorModalProps> = ({
  isOpen,
  onClose,
  stage,
  isNew,
  existingIds,
  onSave,
}) => {
  const [name, setName] = useState(stage.name);
  const [emoji, setEmoji] = useState(stage.emoji);
  const [color, setColor] = useState(stage.color);
  const [error, setError] = useState('');

  const generateId = (name: string): string => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
  };

  const handleSave = () => {
    if (!name.trim()) {
      setError('Stage name is required');
      return;
    }

    const id = isNew ? generateId(name) : stage.id;

    if (isNew && existingIds.includes(id)) {
      setError('A stage with a similar name already exists');
      return;
    }

    onSave({
      ...stage,
      id,
      name: name.trim(),
      emoji,
      color,
      isDefault: isNew ? false : stage.isDefault,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isNew ? 'Add Stage' : 'Edit Stage'} size="md">
      <div className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Stage Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); setError(''); }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="e.g. Initial Meeting"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Emoji</label>
          <div className="flex flex-wrap gap-2">
            {EMOJI_SUGGESTIONS.map((e) => (
              <button
                key={e}
                onClick={() => setEmoji(e)}
                className={`w-10 h-10 text-xl rounded-lg border-2 transition-colors ${
                  emoji === e ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {e}
              </button>
            ))}
          </div>
          <div className="mt-2">
            <input
              type="text"
              value={emoji}
              onChange={(e) => setEmoji(e.target.value)}
              className="w-20 px-3 py-1 text-center text-xl border border-gray-300 rounded-lg"
              maxLength={2}
              placeholder="😀"
            />
            <span className="ml-2 text-xs text-gray-500">Or type any emoji</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_COLORS.map((c) => (
              <button
                key={c.name}
                onClick={() => setColor(c.name)}
                className={`w-10 h-10 rounded-lg border-2 transition-all bg-${c.name}-200 ${
                  color === c.name ? 'border-gray-900 ring-2 ring-offset-1 ring-gray-400' : 'border-transparent hover:border-gray-300'
                }`}
                title={c.label}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <span className="text-sm text-gray-600">Preview:</span>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg bg-${color}-100 border border-${color}-300`}>
            <span className="text-lg">{emoji}</span>
            <span className="font-medium text-gray-900">{name || 'Stage Name'}</span>
          </div>
        </div>

        <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSave}>{isNew ? 'Add Stage' : 'Save Changes'}</Button>
        </div>
      </div>
    </Modal>
  );
};
