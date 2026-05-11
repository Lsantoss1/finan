'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Loader2, ArrowUpRight, ArrowDownRight, ArrowLeftRight, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Account, Category, TransactionType } from '@/types';
import { AIService } from '@/lib/ai';
import { parseBankStatement } from '@/app/actions/ai';
import toast from 'react-hot-toast';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialType?: TransactionType;
}

export default function TransactionModal({ isOpen, onClose, onSuccess, initialType = 'expense' }: TransactionModalProps) {
  const supabase = createClient();
  const [type, setType] = useState<TransactionType>(initialType);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  
  // Form state
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [accountId, setAccountId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [cardId, setCardId] = useState('');
  const [toAccountId, setToAccountId] = useState(''); 
  const [paymentMethod, setPaymentMethod] = useState<'account' | 'card'>('account');
  const [tags, setTags] = useState('');
  
  // Advanced Planning
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceType] = useState('monthly'); // setRecurrenceType removido por não ser usado
  const [isVariable, setIsVariable] = useState(false);
  const [isTemporary, setIsTemporary] = useState(false);
  const [selectedMonths, setSelectedMonths] = useState<number[]>([]);
  const [installmentTotal, setInstallmentTotal] = useState('1');

  // Import State
  const [activeTab, setActiveTab] = useState<'form' | 'import'>('form');
  const [importText, setImportText] = useState('');

  // Data from Supabase
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cards, setCards] = useState<any[]>([]); // Mantido any temporariamente para os cartões

  const loadFormData = useCallback(async () => {
    setFetching(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [accs, cats, crds] = await Promise.all([
      supabase.from('accounts').select('*').eq('user_id', user.id).eq('is_active', true),
      supabase.from('categories').select('*').eq('user_id', user.id).order('name'),
      supabase.from('credit_cards').select('*').eq('user_id', user.id).eq('is_active', true)
    ]);

    setAccounts(accs.data || []);
    setCategories(cats.data || []);
    setCards(crds.data || []);
    
    if (accs.data?.length) setAccountId(accs.data[0].id);
    if (crds.data?.length) setCardId(crds.data[0].id);
    
    setFetching(false);
  }, [supabase]);

  useEffect(() => {
    if (isOpen) {
      loadFormData();
      setType(initialType);
      setAmount('');
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
      setTags('');
      setIsRecurring(false);
      setIsVariable(false);
      setIsTemporary(false);
      setSelectedMonths([]);
      setInstallmentTotal('1');
      setPaymentMethod('account');
      setActiveTab('form');
      setImportText('');
    }
  }, [isOpen, initialType, loadFormData]);

  const toggleMonth = (month: number) => {
    setSelectedMonths(prev => 
      prev.includes(month) ? prev.filter(m => m !== month) : [...prev, month]
    );
  };

  const handleDescriptionChange = async (val: string) => {
    setDescription(val);
    if (!categoryId && val.length > 3) {
      const predictedId = await AIService.predictCategory(val, categories);
      if (predictedId) setCategoryId(predictedId);
    }
  };

  const handleAIScan = async () => {
    if (!description) {
      toast.error("Digite ou cole o extrato na descrição primeiro!");
      return;
    }

    setAnalyzing(true);
    try {
      const res = await parseBankStatement(description);
      if (res.error) {
        toast.error("IA na Nuvem indisponível. Usando Scanner Local.");
        const amountMatch = description.match(/(\d+[,.]\d+)/);
        if (amountMatch) {
          const val = parseFloat(amountMatch[0].replace(',', '.'));
          setAmount(val.toString());
        }
        
        const predictedCat = await AIService.predictCategory(description, categories);
        if (predictedCat) setCategoryId(predictedCat);
        
        toast.success("Scanner Local: Dados básicos extraídos!");
      } else if (res.text) {
        try {
          const cleanedText = res.text.replace(/```json|```/g, '').trim();
          const parsed = JSON.parse(cleanedText);
          const data = Array.isArray(parsed) ? parsed[0] : parsed;
          
          if (data.amount) setAmount(Math.abs(data.amount).toString());
          if (data.description) setDescription(data.description);
          if (data.type) setType(data.type);
          
          const predictedCat = await AIService.predictCategory(data.description || description, categories);
          if (predictedCat) setCategoryId(predictedCat);
          
          toast.success("IA: Transação analisada com sucesso!");
        } catch {
          toast.error("Erro ao processar resposta da IA");
        }
      }
    } catch {
      toast.error("Erro na análise. Tente novamente.");
    } finally {
      setAnalyzing(false);
    }
  };

  const parseImportText = () => {
    const dateRegex = /(\d{1,2})\/(\d{1,2})/;
    const amountRegex = /(?:R\$?\s?)?(\d{1,3}(?:\.\d{3})*,\d{2}|\d+\.\d{2}|\d+,\d{2})/;
    
    const lines = importText.split('\n');
    for (const line of lines) {
      const dateMatch = line.match(dateRegex);
      const amountMatch = line.match(amountRegex);
      
      if (dateMatch && amountMatch) {
        const day = dateMatch[1].padStart(2, '0');
        const month = dateMatch[2].padStart(2, '0');
        const year = new Date().getFullYear();
        setDate(`${year}-${month}-${day}`);
        
        const val = amountMatch[1].replace('R$', '').replace(/\./g, '').replace(',', '.').trim();
        setAmount(val);
        
        const desc = line.replace(dateMatch[0], '').replace(amountMatch[0], '').trim();
        setDescription(desc);
        
        toast.success('Dados identificados!');
        setActiveTab('form');
        return;
      }
    }
    toast.error('Não consegui identificar os dados via busca simples.');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return toast.error('Informe um valor válido');
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const numInstallments = parseInt(installmentTotal);
      const transactionsToInsert = [];

      for (let i = 0; i < numInstallments; i++) {
        const currentDate = new Date(date);
        currentDate.setMonth(currentDate.getMonth() + i);

        transactionsToInsert.push({
          user_id: user.id,
          amount: parseFloat(amount),
          description: numInstallments > 1 
            ? `${description || 'Parcela'} (${i + 1}/${numInstallments})` 
            : (description || null),
          date: currentDate.toISOString().split('T')[0],
          type,
          account_id: paymentMethod === 'account' ? (accountId || null) : null,
          card_id: paymentMethod === 'card' ? cardId : null,
          category_id: type === 'transfer' ? null : categoryId,
          transfer_to_account_id: type === 'transfer' ? toAccountId : null,
          tags: tags.split(',').map(t => t.trim()).filter(Boolean),
          is_recurring: isRecurring,
          recurrence_type: isRecurring ? recurrenceType : null,
          installment_total: numInstallments > 1 ? numInstallments : null,
          installment_number: numInstallments > 1 ? i + 1 : null,
        });
      }

      const { error } = await supabase.from('transactions').insert(transactionsToInsert);
      if (error) throw error;

      toast.success(numInstallments > 1 ? `${numInstallments} parcelas geradas!` : 'Transação registrada!');
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao salvar transação';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const typeConfig = {
    expense: { label: 'Despesa', color: 'var(--danger)', bg: 'var(--danger-bg)', icon: ArrowDownRight },
    income: { label: 'Receita', color: 'var(--success)', bg: 'var(--success-bg)', icon: ArrowUpRight },
    transfer: { label: 'Transferência', color: 'var(--primary)', bg: 'var(--primary-light)20', icon: ArrowLeftRight },
  };

  const Config = typeConfig[type];
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-lg rounded-3xl overflow-hidden animate-scale-in max-h-[90vh] flex flex-col" style={{ background: 'var(--surface)', boxShadow: 'var(--shadow-xl)' }} onClick={e => e.stopPropagation()}>
        <div className="flex border-b border-[var(--border)] shrink-0">
          <button onClick={() => setActiveTab('form')} className={cn("flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all", activeTab === 'form' ? "text-[var(--primary)] border-b-2 border-[var(--primary)]" : "text-gray-400")}>Manual</button>
          <button onClick={() => setActiveTab('import')} className={cn("flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all", activeTab === 'import' ? "text-[var(--primary)] border-b-2 border-[var(--primary)]" : "text-gray-400")}>Importar (Beta)</button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {activeTab === 'import' ? (
            <div className="p-8 space-y-6 animate-fade-in">
              <div className="text-center space-y-2">
                <h3 className="text-lg font-black" style={{ color: 'var(--text)' }}>Conciliação Inteligente</h3>
                <p className="text-xs opacity-50">Cole abaixo uma linha do extrato do seu banco ou SMS de gasto.</p>
              </div>
              <textarea 
                value={importText}
                onChange={e => setImportText(e.target.value)}
                placeholder="Ex: 10/05 COMPRA CARTAO R$ 50,00"
                className="w-full h-32 p-4 rounded-2xl border outline-none text-sm font-mono"
                style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
              />
              <div className="flex gap-3">
                <button type="button" onClick={parseImportText} className="flex-1 py-4 rounded-2xl font-bold text-[var(--text-secondary)] border border-[var(--border)] hover:bg-[var(--surface-hover)] transition-all">Busca Simples</button>
                <button type="button" onClick={handleAIScan} disabled={analyzing} className="flex-1 py-4 rounded-2xl font-black text-white gradient-primary shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2">
                  {analyzing ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
                  Super Analisar (IA)
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSave} className="p-6 space-y-6">
              <div className="flex p-1 gap-1 rounded-2xl" style={{ background: 'var(--bg-secondary)' }}>
                {(['expense', 'income', 'transfer'] as const).map((t) => (
                  <button key={t} type="button" onClick={() => setType(t)} className={cn('flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2', type === t ? 'bg-white shadow-sm' : 'text-gray-500 hover:text-gray-700')} style={type === t ? { color: typeConfig[t].color } : {}}>{typeConfig[t].label}</button>
                ))}
              </div>

              <div className="text-center py-2">
                <div className="relative flex items-center justify-center">
                  <span className="text-2xl font-bold mr-2" style={{ color: Config.color }}>R$</span>
                  <input type="number" step="0.01" placeholder="0,00" value={amount} onChange={e => setAmount(e.target.value)} autoFocus required className="text-4xl font-bold bg-transparent border-none outline-none text-center w-full max-w-[200px]" style={{ color: 'var(--text)' }} />
                </div>
              </div>

              {type === 'expense' && (
                <div className="flex p-1 bg-[var(--bg-secondary)] rounded-xl">
                  <button type="button" onClick={() => setPaymentMethod('account')} className={cn("flex-1 py-1.5 rounded-lg text-xs font-bold transition-all", paymentMethod === 'account' ? "bg-white shadow-sm text-[var(--primary)]" : "text-gray-500")}>Pago com Conta</button>
                  <button type="button" onClick={() => setPaymentMethod('card')} className={cn("flex-1 py-1.5 rounded-lg text-xs font-bold transition-all", paymentMethod === 'card' ? "bg-white shadow-sm text-[var(--primary)]" : "text-gray-500")}>Cartão de Crédito</button>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5 opacity-50">Origem</label>
                  <select value={paymentMethod === 'card' ? cardId : accountId} onChange={e => paymentMethod === 'card' ? setCardId(e.target.value) : setAccountId(e.target.value)} className="w-full px-4 py-3 rounded-xl text-sm border outline-none" style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}>
                    {paymentMethod === 'card' ? cards.map(c => <option key={c.id} value={c.id}>{c.name}</option>) : accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5 opacity-50">{type === 'transfer' ? 'Destino' : 'Categoria'}</label>
                  <select value={type === 'transfer' ? toAccountId : categoryId} onChange={e => type === 'transfer' ? setToAccountId(e.target.value) : setCategoryId(e.target.value)} className="w-full px-4 py-3 rounded-xl text-sm border outline-none" style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}>
                    <option value="">Selecione...</option>
                    {type === 'transfer' ? accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>) : categories.filter(c => c.type === type).map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5 opacity-50">Data</label>
                  <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full px-4 py-3 rounded-xl text-sm border outline-none" style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5 opacity-50">Parcelas</label>
                  <input type="number" min="1" value={installmentTotal} onChange={e => setInstallmentTotal(e.target.value)} placeholder="Parcelas" className="w-full px-4 py-3 rounded-xl text-sm border outline-none" style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }} />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-[var(--border)]">
                 <div className="flex items-center justify-between p-4 rounded-2xl bg-[var(--bg-secondary)]">
                    <div className="flex items-center gap-3">
                       <Zap size={18} className={isRecurring ? "text-purple-500" : "text-gray-400"} />
                       <div>
                          <p className="text-xs font-bold" style={{ color: 'var(--text)' }}>Gasto Fixo / Recorrente</p>
                          <p className="text-[10px] opacity-50">Repetir todo mês</p>
                       </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={isRecurring} onChange={e => setIsRecurring(e.target.checked)} className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                    </label>
                 </div>

                 {isRecurring && (
                   <div className="space-y-4 animate-fade-in pl-4 border-l-2 border-purple-500/30">
                      <div className="flex items-center justify-between">
                         <span className="text-xs font-bold" style={{ color: 'var(--text)' }}>Valor Variável</span>
                         <label className="relative inline-flex items-center cursor-pointer">
                           <input type="checkbox" checked={isVariable} onChange={e => setIsVariable(e.target.checked)} className="sr-only peer" />
                           <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                         </label>
                      </div>

                      <div className="flex items-center justify-between">
                         <span className="text-xs font-bold" style={{ color: 'var(--text)' }}>Temporário (Meses específicos)</span>
                         <label className="relative inline-flex items-center cursor-pointer">
                           <input type="checkbox" checked={isTemporary} onChange={e => setIsTemporary(e.target.checked)} className="sr-only peer" />
                           <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                         </label>
                      </div>

                      {isTemporary && (
                        <div className="grid grid-cols-4 gap-2 animate-scale-in">
                           {months.map((m, i) => (
                             <button 
                                key={m} type="button"
                                onClick={() => toggleMonth(i + 1)}
                                className={cn(
                                  "py-2 rounded-lg text-[10px] font-bold border transition-all",
                                  selectedMonths.includes(i + 1) ? "bg-blue-500 border-blue-500 text-white shadow-lg scale-105" : "border-[var(--border)] opacity-50"
                                )}
                             >
                               {m}
                             </button>
                           ))}
                        </div>
                      )}
                   </div>
                 )}
              </div>

              <input value={description} onChange={e => handleDescriptionChange(e.target.value)} placeholder="Descrição (ex: Aluguel, Cinema...)" className="w-full px-4 py-4 rounded-2xl text-sm border outline-none" style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }} />

              <button type="submit" disabled={loading || fetching} className="w-full py-5 rounded-[2rem] font-black text-white shadow-xl active:scale-95 transition-all text-lg" style={{ background: Config.color }}>{loading ? 'Salvando...' : `Confirmar ${Config.label}`}</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
