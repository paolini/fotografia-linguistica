import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
  } from 'chart.js';
import { Bar } from "react-chartjs-2"
import ChartDataLabels from 'chartjs-plugin-datalabels'

import { useStats } from '@/lib/api'
import { IStats, IQuestionStat } from '@/pages/api/stats'
import questionsData from '@/lib/questions'

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ChartDataLabels,
)

export default function Stats() {
    const statsQuery = useStats()

    if (statsQuery.isLoading) return <div>Loading...</div>
    if (!statsQuery.data) return <div>Failed to load</div>

    const stats = statsQuery.data.data

    const questions: {[key:string]: IQuestionStat} 
        = Object.fromEntries(stats.questions.map(
            q => [q.question.code, q]))

    return <div>
        <h1>Risultati aggregati</h1>
        <ListClasses stats={stats} />
        <GraphQuestion stat={questions["1.1.a.1"]} />
    </div>
}

function ListClasses({ stats }: {stats: IStats}) {
    return <div>
        <h2>Classi che hanno partecipato</h2>
        <ul>
            { stats.classes.map(c => 
                    <li key={c._id.toString()}>
                        {c.school} {c.class}
                    </li>
                )
            }
        </ul>
        Totale questionari: {stats.entriesCount}
    </div>
}

function GraphQuestion({stat}: {stat: IQuestionStat}) {
    return <div style={{maxWidth:1000}}>
        <GraphChooseLanguageQuestion stat={stat} />
    </div>
}

function GraphChooseLanguageQuestion({stat}: {stat: IQuestionStat}) {
    const languages = questionsData.languages
    if (!stat.answers) return <div>invalid answers</div>
      
    return <Bar 
        options={{
            responsive: true,
            plugins: {
                legend: {
                    display: false,
                    position: 'top' as const,
                },
                datalabels: {
                    anchor: 'end',
                    align: 'end',
                    formatter: value => `${Math.round(value*100)}%`
                },
                title: {
                    display: true,
                    text: stat.question.question.it,
                },
            },
            scales: {
                y: {
                    min: 0,
                    max: 1,
                    ticks: {
                        precision: 1,
                        format: {
                            style: 'percent',
                        },
                        callback: value => typeof(value)==='number'?`${Math.round(value*100)}%`:'???',
                    },
                }
            }
        }} 
        data={{
            labels: Object.keys(stat.answers).map(id => (id in languages?languages[id]['it']:id)),
            datasets: [
                {
                data: Object.entries(stat.answers).map(([key, val])=>val),
                backgroundColor: 'orange',
                },
            ],
            }} 
    />
}

