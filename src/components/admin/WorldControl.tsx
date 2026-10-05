import React, { useState } from 'react';
import { useUniverse } from '../../context/UniverseContext';
import { dbService } from '../../services/db';
import { World } from '../../types/database';
import { 
  Plus, 
  Edit, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Eye, 
  EyeOff, 
  X, 
  Save, 
  Layers,
  Sparkles
} from 'lucide-react';

export const WorldControl: React.FC = () => {
  const { worlds, refreshData } = useUniverse();
  const [editingWorld, setEditingWorld] = useState<Partial<World> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleOpenNew = () => {
    setEditingWorld({
      id: `world_${Date.now()}`,
      name: '',
      slug: '',
      tagline: '',
      description: '',
      icon: 'Brain',
      color: '#00f0ff',
      accent_color: '#3b82f6',
      display_order: worlds.length + 1,
      is_enabled: true,
      visual_properties: { ring_style: 'single', orbit_speed: 1, glow_intensity: 1 }
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (w: World) => {
    setEditingWorld({ ...w });
    setIsModalOpen(true);
  };

  const handleToggleEnabled = async (w: World) => {
    await dbService.saveWorld({ ...w, is_enabled: !w.is_enabled });
    await refreshData();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this AI World sector?')) {
      try {
        await dbService.deleteWorld(id);
        await refreshData();
      } catch (err: any) {
        console.error('Failed to delete world', err);
        alert(`Error deleting AI World sector: ${err?.message || 'Unknown error'}`);
      }
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= worlds.length) return;

    const reordered = [...worlds];
    const temp = reordered[index];
    reordered[index] = reordered[targetIdx];
    reordered[targetIdx] = temp;

    await dbService.reorderWorlds(reordered.map(w => w.id));
    await refreshData();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWorld || !editingWorld.name) return;

    setIsSaving(true);
    try {
      const slug = editingWorld.slug || editingWorld.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      await dbService.saveWorld({
        ...(editingWorld as World),
        slug
      });
      await refreshData();
      setIsModalOpen(false);
      setEditingWorld(null);
    } catch (err: any) {
      console.error('Failed to save world', err);
      alert(`Error saving AI World: ${err?.message || 'Unknown error'}`);
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
            AI Worlds Sector Configuration
          </h2>
          <p className="text-xs font-mono text-cyan-400">
            {worlds.length} Total Sectors ({worlds.filter(w => w.is_enabled).length} Enabled)
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs tracking-wider uppercase transition-all shadow-glow-cyan flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Create AI World
        </button>
      </div>

      {/* Worlds List */}
      {worlds.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-space-900/50 border border-slate-800 text-slate-400 font-mono text-xs">
          No AI World sectors registered. Click "Create AI World" to define your first sector.
        </div>
      ) : (
        <div className="space-y-3">
          {worlds.map((w, index) => (
          <div
            key={w.id}
            className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              w.is_enabled
                ? 'bg-space-900/70 border-slate-800'
                : 'bg-space-950/40 border-slate-900 opacity-60'
            }`}
          >
            {/* World info */}
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center font-bold"
                style={{ backgroundColor: `${w.color}20`, color: w.color, border: `1px solid ${w.color}40` }}
              >
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold font-display text-white">{w.name}</h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-space-850 text-slate-400 border border-slate-700">
                    {w.slug}
                  </span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-1">{w.tagline || w.description}</p>
              </div>
            </div>

            {/* Actions: Reorder, Toggle, Edit, Delete */}
            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                disabled={index === 0}
                onClick={() => handleMove(index, 'up')}
                className="p-1.5 rounded-lg bg-space-850 hover:bg-space-800 disabled:opacity-30 text-slate-400"
                title="Move Up"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
              <button
                disabled={index === worlds.length - 1}
                onClick={() => handleMove(index, 'down')}
                className="p-1.5 rounded-lg bg-space-850 hover:bg-space-800 disabled:opacity-30 text-slate-400"
                title="Move Down"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleToggleEnabled(w)}
                className={`p-1.5 rounded-lg transition-colors ${
                  w.is_enabled ? 'bg-cyan-950/60 text-cyan-400' : 'bg-space-850 text-slate-500'
                }`}
                title={w.is_enabled ? 'Disable World' : 'Enable World'}
              >
                {w.is_enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => handleOpenEdit(w)}
                className="p-1.5 rounded-lg bg-space-850 hover:bg-space-800 text-cyan-400"
                title="Edit World"
              >
                <Edit className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleDelete(w.id)}
                className="p-1.5 rounded-lg bg-space-850 hover:bg-red-950/60 text-red-400"
                title="Delete World"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
      )}

      {/* World Edit Modal */}
      {isModalOpen && editingWorld && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-space-950/85 backdrop-blur-xl">
          <div className="relative w-full max-w-lg rounded-3xl bg-space-900 border border-cyan-500/30 p-6 sm:p-8 text-slate-100">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold font-display text-white mb-6">
              {editingWorld.id ? 'Edit AI World Sector' : 'Create AI World Sector'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-slate-300 mb-1">WORLD NAME *</label>
                <input
                  type="text"
                  required
                  value={editingWorld.name || ''}
                  onChange={(e) => setEditingWorld({ ...editingWorld, name: e.target.value })}
                  placeholder="e.g. AGENTIC AI WORLD"
                  className="w-full px-3 py-2 rounded-xl bg-space-950 border border-slate-700 text-white focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">TAGLINE / DOMAIN FOCUS</label>
                <input
                  type="text"
                  value={editingWorld.tagline || ''}
                  onChange={(e) => setEditingWorld({ ...editingWorld, tagline: e.target.value })}
                  placeholder="e.g. Autonomous Agents, Tool-Use & Swarms"
                  className="w-full px-3 py-2 rounded-xl bg-space-950 border border-slate-700 text-white focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">DESCRIPTION</label>
                <textarea
                  rows={3}
                  value={editingWorld.description || ''}
                  onChange={(e) => setEditingWorld({ ...editingWorld, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-space-950 border border-slate-700 text-white focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 mb-1">PRIMARY COLOR</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={editingWorld.color || '#00f0ff'}
                      onChange={(e) => setEditingWorld({ ...editingWorld, color: e.target.value })}
                      className="w-8 h-8 rounded bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={editingWorld.color || '#00f0ff'}
                      onChange={(e) => setEditingWorld({ ...editingWorld, color: e.target.value })}
                      className="flex-1 px-2 py-1 rounded-lg bg-space-950 border border-slate-700 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">ICON IDENTIFIER</label>
                  <select
                    value={editingWorld.icon || 'Brain'}
                    onChange={(e) => setEditingWorld({ ...editingWorld, icon: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-space-950 border border-slate-700 text-white"
                  >
                    <option value="Brain">Brain (ML)</option>
                    <option value="Bot">Bot (Agentic AI)</option>
                    <option value="Sparkles">Sparkles (Generative AI)</option>
                    <option value="Database">Database (RAG)</option>
                    <option value="Eye">Eye (Computer Vision)</option>
                    <option value="MessageSquare">MessageSquare (NLP)</option>
                    <option value="Cpu">Cpu (Engineering)</option>
                    <option value="Rocket">Rocket (Space-Tech)</option>
                  </select>
                </div>
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
                  <Save className="w-4 h-4" /> Save World
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
