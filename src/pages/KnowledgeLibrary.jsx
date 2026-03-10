import { useState, useMemo } from 'react';
import PageHeader from '../components/PageHeader';
import Icon from '../components/Icon';
import { DISCIPLINES, KNOWLEDGE_ARTICLES, searchArticles, getArticlesByDiscipline, getAllCategories } from '../data/technicalKnowledge';

export default function KnowledgeLibrary({ onMenuClick, toast }) {
    const [activeDiscipline, setActiveDiscipline] = useState(null);
    const [activeCategory, setActiveCategory] = useState(null);
    const [search, setSearch] = useState('');
    const [expandedArticle, setExpandedArticle] = useState(null);

    const filteredArticles = useMemo(() => {
        let articles = KNOWLEDGE_ARTICLES;
        if (activeDiscipline) articles = articles.filter(a => a.discipline === activeDiscipline);
        if (activeCategory) articles = articles.filter(a => a.category === activeCategory);
        if (search) articles = searchArticles(search).filter(a =>
            (!activeDiscipline || a.discipline === activeDiscipline)
        );
        return articles;
    }, [activeDiscipline, activeCategory, search]);

    const categories = useMemo(() => {
        const arts = activeDiscipline ? KNOWLEDGE_ARTICLES.filter(a => a.discipline === activeDiscipline) : KNOWLEDGE_ARTICLES;
        return [...new Set(arts.map(a => a.category))];
    }, [activeDiscipline]);

    const disciplineCounts = useMemo(() => {
        const counts = {};
        DISCIPLINES.forEach(d => { counts[d.id] = KNOWLEDGE_ARTICLES.filter(a => a.discipline === d.id).length; });
        return counts;
    }, []);

    const renderContent = (content) => {
        return content.split('\n').map((line, i) => {
            if (line.startsWith('## ')) return <h3 key={i} className="kb-h3">{line.slice(3)}</h3>;
            if (line.startsWith('### ')) return <h4 key={i} className="kb-h4">{line.slice(4)}</h4>;
            if (line.startsWith('| ')) {
                const cells = line.split('|').filter(c => c.trim()).map(c => c.trim());
                if (cells.every(c => c.match(/^[-:]+$/))) return null;
                const isHeader = i > 0 && content.split('\n')[i + 1]?.includes('---');
                return (
                    <div key={i} className={`kb-table-row ${isHeader ? 'kb-table-header' : ''}`}>
                        {cells.map((c, j) => <span key={j} className="kb-table-cell">{c}</span>)}
                    </div>
                );
            }
            if (line.startsWith('- **')) {
                const match = line.match(/^- \*\*(.*?)\*\*:?\s*(.*)/);
                if (match) return <div key={i} className="kb-def"><strong>{match[1]}</strong>: {match[2]}</div>;
            }
            if (line.startsWith('- ')) return <div key={i} className="kb-list-item">• {line.slice(2)}</div>;
            if (line.match(/^\d+\. /)) return <div key={i} className="kb-list-item">{line}</div>;
            if (line.startsWith('**')) {
                return <div key={i} className="kb-bold" dangerouslySetInnerHTML={{
                    __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                }} />;
            }
            if (line.startsWith('*') && line.endsWith('*')) return <div key={i} className="kb-italic">{line.slice(1, -1)}</div>;
            if (!line.trim()) return <div key={i} className="kb-spacer" />;
            return <div key={i} className="kb-text">{line}</div>;
        });
    };

    return (
        <>
            <PageHeader title="Knowledge Library" subtitle={`${KNOWLEDGE_ARTICLES.length} technical articles across ${DISCIPLINES.length} disciplines`} onMenuClick={onMenuClick}>
                <a href="#/ai-assistant" className="btn btn-primary"><Icon name="psychology" size={14} /> Ask AI Brain</a>
            </PageHeader>

            <div className="page-body">
                {/* Discipline Cards */}
                <div className="discipline-grid">
                    {DISCIPLINES.map(d => (
                        <button key={d.id}
                            className={`discipline-card ${activeDiscipline === d.id ? 'active' : ''}`}
                            onClick={() => { setActiveDiscipline(activeDiscipline === d.id ? null : d.id); setActiveCategory(null); }}
                            style={{ '--disc-color': d.color }}>
                            <div className="discipline-card-icon"><Icon name={d.icon} size={28} /></div>
                            <div className="discipline-card-name">{d.name}</div>
                            <div className="discipline-card-count">{disciplineCounts[d.id]} articles</div>
                        </button>
                    ))}
                </div>

                {/* Search & Filters */}
                <div className="filters-bar mt-24">
                    <div className="search-bar" style={{ maxWidth: 400 }}>
                        <span className="search-bar-icon"><Icon name="search" size={16} /></span>
                        <input placeholder="Search articles, tags, content..." value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    {categories.map(c => (
                        <button key={c}
                            className={`filter-chip ${activeCategory === c ? 'active' : ''}`}
                            onClick={() => setActiveCategory(activeCategory === c ? null : c)}>
                            {c}
                        </button>
                    ))}
                    {(activeDiscipline || activeCategory || search) && (
                        <button className="btn btn-ghost btn-sm" onClick={() => { setActiveDiscipline(null); setActiveCategory(null); setSearch(''); }}>
                            ✕ Clear Filters
                        </button>
                    )}
                </div>

                {/* Results */}
                <div className="kb-results mt-16">
                    <div className="text-muted text-sm mb-16">{filteredArticles.length} articles found</div>
                    {filteredArticles.map(article => {
                        const disc = DISCIPLINES.find(d => d.id === article.discipline);
                        const isExpanded = expandedArticle === article.id;
                        return (
                            <div key={article.id} className={`kb-article-card ${isExpanded ? 'expanded' : ''}`}>
                                <div className="kb-article-header" onClick={() => setExpandedArticle(isExpanded ? null : article.id)}>
                                    <div className="kb-article-icon" style={{ color: disc?.color }}><Icon name={disc?.icon || 'article'} size={20} /></div>
                                    <div className="kb-article-info">
                                        <div className="kb-article-title">{article.title}</div>
                                        <div className="kb-article-meta">
                                            <span className="badge" style={{ background: `${disc?.color}20`, color: disc?.color }}>{disc?.name}</span>
                                            <span className="badge badge-draft">{article.category}</span>
                                            {article.tags.slice(0, 3).map(t => (
                                                <span key={t} className="kb-tag">{t}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <span className="kb-article-expand"><Icon name={isExpanded ? 'expand_less' : 'expand_more'} size={18} /></span>
                                </div>
                                {isExpanded && (
                                    <div className="kb-article-body">{renderContent(article.content)}</div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
}
