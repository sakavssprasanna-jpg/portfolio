import React, { useState } from 'react';
import { useUniverse } from '../../context/UniverseContext';
import { dbService } from '../../services/db';
import { Skill } from '../../types/database';
import { Plus, Edit, Trash2, X, Save, ArrowUp, ArrowDown, Cpu, Sparkles } from 'lucide-react';

export const SkillControl: React.FC = () => {
  const { skills, refreshData } = useUniverse();
  const [editingSkill, setEditingSkill] = useState<Partial<Skill> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [relatedSkillsInput, setRelatedSkillsInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleOpenNew = () => {
    setEditingSkill({
      id: `skill_${Date.now()}`,
      name: '',
      category: 'AI / ML',
      description: '',
      proficiency: null,
      related_skills: [],
      display_order: skills.length + 1
    });
    setRelatedSkillsInput('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (s: Skill) => {
    setEditingSkill({ ...s });
    setRelatedSkillsInput((s.related_skills || []).join(', '));
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this skill node from the constellation?')) {
      await dbService.deleteSkill(id);
      await refreshData();
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= skills.length) return;

    const reordered = [...skills];
    const temp = reordered[index];
    reordered[index] = reordered[targetIdx];
    reordered[targetIdx] = temp;

    await dbService.reorderSkills(reordered.map(s => s.id));
    await refreshData();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSkill || !editingSkill.name) return;

    setIsSaving(true);
    try {
      const related = relatedSkillsInput.split(',').map(s => s.trim()).filter(Boolean);
      await dbService.saveSkill({
        ...(editingSkill as Skill),
        description: editingSkill.description || '',
        related_skills: related
      });
      await refreshData();
      setIsModalOpen(false);
      setEditingSkill(null);
    } catch (err) {
      console.error('Failed to save skill', err);
      alert('Error saving skill.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Add Button */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-white">
            Skill Constellation Telemetry
          </h2>
          <p className="text-xs font-mono text-cyan-400">
            {skills.length} Technical Competencies Registered
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs tracking-wider uppercase transition-all shadow-glow-cyan flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Skill Node
        </button>
      </div>

      {skills.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-space-900/50 border border-slate-800 text-slate-400 font-mono text-xs">
          No skills registered in the constellation yet. Add skills manually or ingest your resume via Resume Intelligence.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {skills.map((s, index) => (
            <div
              key={s.id}
              className="p-4 rounded-2xl bg-space-900/70 border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[10px] font-mono text-cyan-400 uppercase">
                    {s.category}
                  </span>
                  {s.proficiency !== null && s.proficiency !== undefined && (
                    <span className="text-[10px] font-mono text-slate-400">
                      {s.proficiency}%
                    </span>
                  )}
                </div>

                <div className="text-sm font-bold font-display text-white">
                  {s.name}
                </div>

                {s.description && (
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                    {s.description}
                  </p>
                )}

                {s.related_skills && s.related_skills.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {s.related_skills.slice(0, 3).map((r, i) => (
                      <span key={i} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-space-850 text-slate-400 border border-slate-800">
                        {r}
                      </span>
                    ))}
                    {s.related_skills.length > 3 && (
                      <span className="text-[9px] font-mono text-slate-500">
                        +{s.related_skills.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between mt-3">
                <div className="flex items-center gap-1">
                  <button
                    disabled={index === 0}
                    onClick={() => handleMove(index, 'up')}
                    className="p-1 rounded bg-space-850 hover:bg-space-800 disabled:opacity-30 text-slate-400"
                    title="Move Up"
                  >
                    <ArrowUp className="w-3 h-3" />
                  </button>
                  <button
                    disabled={index === skills.length - 1}
                    onClick={() => handleMove(index, 'down')}
                    className="p-1 rounded bg-space-850 hover:bg-space-800 disabled:opacity-30 text-slate-400"
                    title="Move Down"
                  >
                    <ArrowDown className="w-3 h-3" />
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(s)}
                    className="p-1.5 rounded-lg bg-space-850 hover:bg-space-800 text-cyan-400"
                    title="Edit Skill"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(s.id)}
                    className="p-1.5 rounded-lg bg-space-850 hover:bg-red-950/60 text-red-400"
                    title="Delete Skill"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Skill Modal */}
      {isModalOpen && editingSkill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-space-950/85 backdrop-blur-xl">
          <div className="relative w-full max-w-md rounded-3xl bg-space-900 border border-cyan-500/30 p-6 sm:p-8 text-slate-100">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold font-display text-white mb-6">
              {editingSkill.id ? 'Edit Skill Node' : 'Add Skill Node'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-slate-300 mb-1">SKILL NAME *</label>
                <input
                  type="text"
                  required
                  value={editingSkill.name || ''}
                  onChange={(e) => setEditingSkill({ ...editingSkill, name: e.target.value })}
                  placeholder="e.g. PyTorch"
                  className="w-full px-3 py-2 rounded-xl bg-space-950 border border-slate-700 text-white focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">CATEGORY</label>
                <input
                  type="text"
                  value={editingSkill.category || ''}
                  onChange={(e) => setEditingSkill({ ...editingSkill, category: e.target.value })}
                  placeholder="e.g. AI / ML, Agentic AI & RAG, Computer Vision"
                  className="w-full px-3 py-2 rounded-xl bg-space-950 border border-slate-700 text-white focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">DESCRIPTION / CONTEXT (OPTIONAL)</label>
                <textarea
                  rows={2}
                  value={editingSkill.description || ''}
                  onChange={(e) => setEditingSkill({ ...editingSkill, description: e.target.value })}
                  placeholder="Brief context on how you use this technology or capability..."
                  className="w-full px-3 py-2 rounded-xl bg-space-950 border border-slate-700 text-white focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">
                  PROFICIENCY PERCENTAGE (OPTIONAL - LEAVE BLANK IF PREFERRED)
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={editingSkill.proficiency ?? ''}
                  onChange={(e) => setEditingSkill({ 
                    ...editingSkill, 
                    proficiency: e.target.value ? parseInt(e.target.value, 10) : null 
                  })}
                  placeholder="Leave empty or enter 1-100"
                  className="w-full px-3 py-2 rounded-xl bg-space-950 border border-slate-700 text-white focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">RELATED SKILLS (COMMA-SEPARATED)</label>
                <input
                  type="text"
                  value={relatedSkillsInput}
                  onChange={(e) => setRelatedSkillsInput(e.target.value)}
                  placeholder="CUDA, TorchScript, Deep Learning"
                  className="w-full px-3 py-2 rounded-xl bg-space-950 border border-slate-700 text-white focus:border-cyan-400"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-space-850 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold uppercase transition-all shadow-glow-cyan flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" /> Save Skill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
