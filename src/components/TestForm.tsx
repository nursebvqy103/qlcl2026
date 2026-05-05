import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { AlertCircle, Award, Briefcase, CheckCircle2, Loader2, MapPin, Play, RotateCcw, Send, User } from 'lucide-react';
import testData from '../../test.json';
import { supabase } from '../lib/supabase';

type TestAnswer = {
  id: string;
  text: string;
  is_correct: boolean;
};

type TestQuestion = {
  id: number;
  question: string;
  type: string;
  answers: TestAnswer[];
  module?: string;
  difficulty?: string;
  score?: number;
};

type QuizData = {
  quiz_id?: string;
  title?: string;
  questions: TestQuestion[];
};

const QUESTION_COUNT = 30;
const quiz = testData as QuizData;

const shuffle = <T,>(items: T[]) => {
  const copied = [...items];
  for (let i = copied.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copied[i], copied[j]] = [copied[j], copied[i]];
  }
  return copied;
};

const TestForm = () => {
  const [profile, setProfile] = useState({
    full_name: '',
    rank_position: '',
    unit: ''
  });
  const [started, setStarted] = useState(false);
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(true);
  const [testOpen, setTestOpen] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ score: number; total: number; percentage: number } | null>(null);

  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);

  useEffect(() => {
    const fetchTestStatus = async () => {
      setStatusLoading(true);
      try {
        const { data, error: fetchError } = await supabase
          .from('app_settings')
          .select('value')
          .eq('key', 'test_open')
          .maybeSingle();

        if (fetchError) throw fetchError;
        setTestOpen(data?.value?.open !== false);
      } catch (err) {
        console.error('Fetch test status error:', err);
        setTestOpen(true);
      } finally {
        setStatusLoading(false);
      }
    };

    fetchTestStatus();
  }, []);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const startTest = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!testOpen) {
      setError('Hiện tại chưa có bài kiểm tra nào, xin vui lòng quay lại sau');
      return;
    }

    if (!profile.full_name.trim() || !profile.rank_position.trim() || !profile.unit.trim()) {
      setError('Vui lòng nhập đầy đủ Họ và tên, Cấp bậc/chức vụ và Đơn vị.');
      return;
    }

    setQuestions(shuffle(quiz.questions).slice(0, QUESTION_COUNT));
    setAnswers({});
    setResult(null);
    setStarted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const chooseAnswer = (questionId: number, answerId: string) => {
    setAnswers((current) => ({ ...current, [questionId]: answerId }));
  };

  const submitTest = async () => {
    setError(null);

    if (answeredCount < questions.length) {
      setError(`Bạn còn ${questions.length - answeredCount} câu chưa trả lời.`);
      return;
    }

    setLoading(true);

    const scoredAnswers = questions.map((question) => {
      const selectedAnswerId = answers[question.id];
      const selectedAnswer = question.answers.find((answer) => answer.id === selectedAnswerId);
      const correctAnswer = question.answers.find((answer) => answer.is_correct);
      const isCorrect = Boolean(selectedAnswer?.is_correct);

      return {
        question_id: question.id,
        question: question.question,
        selected_answer_id: selectedAnswerId,
        selected_answer_text: selectedAnswer?.text ?? '',
        correct_answer_id: correctAnswer?.id ?? '',
        correct_answer_text: correctAnswer?.text ?? '',
        is_correct: isCorrect,
        module: question.module ?? '',
        difficulty: question.difficulty ?? ''
      };
    });

    const score = scoredAnswers.filter((answer) => answer.is_correct).length;
    const total = questions.length;
    const percentage = Math.round((score / total) * 10000) / 100;

    try {
      const { error: submitError } = await supabase.from('kq_test').insert([
        {
          full_name: profile.full_name.trim(),
          rank_position: profile.rank_position.trim(),
          unit: profile.unit.trim(),
          quiz_id: quiz.quiz_id ?? 'qlclbv_2026',
          quiz_title: quiz.title ?? 'Kiểm tra đánh giá cuối khóa',
          total_questions: total,
          score,
          max_score: total,
          percentage,
          questions: questions.map((question) => ({
            id: question.id,
            question: question.question,
            answers: question.answers.map(({ id, text }) => ({ id, text })),
            module: question.module ?? '',
            difficulty: question.difficulty ?? ''
          })),
          answers: scoredAnswers
        }
      ]);

      if (submitError) {
        setError(`Lỗi CSDL: ${submitError.message}`);
        return;
      }

      setResult({ score, total, percentage });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setError('Lỗi kết nối: ' + (err.message || 'Không thể gửi bài kiểm tra.'));
    } finally {
      setLoading(false);
    }
  };

  const resetTest = () => {
    setStarted(false);
    setQuestions([]);
    setAnswers({});
    setResult(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (result) {
    return (
      <div className="max-w-3xl mx-auto p-4 md:p-8">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 md:p-12 text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 text-green-700 flex items-center justify-center mx-auto mb-6">
            <Award size={42} />
          </div>
          <h3 className="text-2xl md:text-3xl font-black text-slate-900 uppercase mb-4">Đã nộp bài kiểm tra</h3>
          <p className="text-slate-500 font-bold mb-8">{profile.full_name} - {profile.unit}</p>
          <div className="grid grid-cols-3 gap-3 mb-8">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Số câu đúng</p>
              <p className="text-2xl font-black text-green-800">{result.score}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Tổng câu</p>
              <p className="text-2xl font-black text-slate-900">{result.total}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Tỷ lệ</p>
              <p className="text-2xl font-black text-red-700">{result.percentage}%</p>
            </div>
          </div>
          <button
            onClick={resetTest}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-widest text-xs hover:bg-red-700 transition-colors"
          >
            <RotateCcw size={16} />
            Làm lại
          </button>
        </div>
      </div>
    );
  }

  if (!started) {
    if (!statusLoading && !testOpen) {
      return (
        <div className="max-w-2xl mx-auto p-4 md:p-8">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 md:p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-red-50 text-red-700 flex items-center justify-center mx-auto mb-6">
              <AlertCircle size={34} />
            </div>
            <h3 className="text-xl md:text-2xl font-black text-slate-900 uppercase mb-3">
              Chưa có bài kiểm tra
            </h3>
            <p className="text-sm md:text-base font-bold text-slate-500">
              Hiện tại chưa có bài kiểm tra nào, xin vui lòng quay lại sau
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-2xl mx-auto p-4 md:p-8">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6 md:p-10">
          <h3 className="text-2xl font-black text-slate-800 mb-2 uppercase tracking-tight text-center">
            Thông tin làm bài
          </h3>
          <p className="text-center text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-8">
            Hệ thống sẽ chọn ngẫu nhiên 30 câu từ bộ {quiz.questions.length} câu hỏi
          </p>

          {statusLoading ? (
            <div className="mb-6 p-4 bg-slate-50 text-slate-500 rounded-2xl border border-slate-100 text-sm font-bold text-center">
              Đang kiểm tra trạng thái bài kiểm tra...
            </div>
          ) : null}

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-2xl border border-red-100 text-sm font-bold text-center flex items-center justify-center gap-2">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <form onSubmit={startTest} className="space-y-5">
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Họ và tên <span className="text-red-500">*</span></label>
              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  name="full_name"
                  value={profile.full_name}
                  onChange={handleProfileChange}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-green-600 focus:border-green-600 outline-none transition-all"
                  placeholder="Nhập họ và tên"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Cấp bậc, chức vụ <span className="text-red-500">*</span></label>
              <div className="relative">
                <Briefcase size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  name="rank_position"
                  value={profile.rank_position}
                  onChange={handleProfileChange}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-green-600 focus:border-green-600 outline-none transition-all"
                  placeholder="Nhập cấp bậc, chức vụ"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Đơn vị <span className="text-red-500">*</span></label>
              <div className="relative">
                <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  name="unit"
                  value={profile.unit}
                  onChange={handleProfileChange}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-green-600 focus:border-green-600 outline-none transition-all"
                  placeholder="Nhập đơn vị"
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={statusLoading || !testOpen}
              className="w-full bg-red-700 hover:bg-red-800 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-red-900/20 uppercase tracking-widest text-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Play size={20} />
              Bắt đầu làm bài
            </motion.button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8">
      <div className="sticky top-16 z-20 bg-white/95 backdrop-blur border border-slate-200 rounded-3xl shadow-sm p-4 md:p-6 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Người làm bài</p>
          <h3 className="font-black text-slate-900 uppercase">{profile.full_name}</h3>
          <p className="text-xs font-bold text-slate-500">{profile.rank_position} - {profile.unit}</p>
        </div>
        <div className="text-left md:text-right">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Tiến độ</p>
          <p className="font-black text-red-700">{answeredCount}/{questions.length} câu</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-2xl border border-red-100 text-sm font-bold text-center flex items-center justify-center gap-2">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <div className="space-y-5">
        {questions.map((question, index) => (
          <div key={question.id} className="bg-white border border-slate-100 rounded-3xl p-5 md:p-7 shadow-sm text-left">
            <div className="flex items-start gap-4 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-green-800 text-white flex items-center justify-center font-black shrink-0">
                {index + 1}
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{question.module}</p>
                <h4 className="font-black text-slate-900 leading-relaxed">{question.question}</h4>
              </div>
            </div>

            <div className="grid gap-3">
              {question.answers.map((answer) => {
                const selected = answers[question.id] === answer.id;
                return (
                  <button
                    key={answer.id}
                    type="button"
                    onClick={() => chooseAnswer(question.id, answer.id)}
                    className={`text-left rounded-2xl border p-4 transition-all flex items-start gap-3 ${
                      selected
                        ? 'border-red-700 bg-red-50 text-red-900 shadow-sm'
                        : 'border-slate-200 bg-slate-50 hover:border-green-700 hover:bg-white'
                    }`}
                  >
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                      selected ? 'bg-red-700 text-white' : 'bg-white text-slate-500 border border-slate-200'
                    }`}>
                      {answer.id}
                    </span>
                    <span className="text-sm font-bold leading-relaxed">{answer.text}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-col md:flex-row gap-3 md:justify-end">
        <button
          onClick={resetTest}
          className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-slate-100 text-slate-700 font-black uppercase tracking-widest text-xs hover:bg-slate-200 transition-colors"
        >
          <RotateCcw size={16} />
          Nhập lại thông tin
        </button>
        <button
          onClick={submitTest}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-red-700 text-white font-black uppercase tracking-widest text-xs hover:bg-red-800 transition-colors disabled:opacity-60"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          {loading ? 'Đang gửi bài...' : 'Nộp bài'}
        </button>
      </div>
    </div>
  );
};

export default TestForm;
