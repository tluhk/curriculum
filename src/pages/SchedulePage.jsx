/* eslint-disable react/prop-types */
import { useMemo, useState } from "react";
import { useCurriculum } from "../state/CurriculumContext";
import schedules from "../data/schedules";
import {
  DAYS, buildSchedule, weekSessions, weekCell, weekNotes, timeRange, toMinutes, longDate, shortDate,
} from "../utils/schedule";
import "../components/schedule/schedule.css";

const PX_PER_MIN = 0.8;
const tint = (c, pct) => `color-mix(in srgb, ${c} ${pct}%, transparent)`;

function Schedule({ json, palette }) {
  const { rows, weeks } = useMemo(() => buildSchedule(json, palette), [json, palette]);
  const range = useMemo(() => timeRange(weeks), [weeks]);
  const [wi, setWi] = useState(0);
  const [focus, setFocus] = useState(null);
  const [selId, setSelId] = useState(null);

  const week = weeks[wi];
  const all = weekSessions(week);
  const sel = all.find((s) => s.id === selId) || all[0];
  const dim = (key) => focus && focus !== key;
  const goWeek = (i) => { setWi(i); setSelId(null); };
  const toggleFocus = (key) => setFocus((f) => (f === key ? null : key));

  const notes = weekNotes(week);
  const totalHours = all.reduce((a, s) => a + s.hours, 0);
  const axisH = (range.end - range.start) * PX_PER_MIN;
  const hours = [];
  for (let m = Math.ceil(range.start / 60) * 60; m < range.end; m += 60) hours.push({ top: (m - range.start) * PX_PER_MIN, label: m / 60 + ":00" });
  const others = sel ? all.filter((o) => o.iso === sel.iso && o.id !== sel.id) : [];

  return (
    <div className="schedule">
      <div className="ohead">
        <div>
          <h1>Millal mis ainet õpetatakse?</h1>
          <p>Ülemisel ajajoonel on iga aine kõik kontaktnädalad. Vali nädal, et näha selle päevi tunnipõhiselt. Vali aine, et teised ained tagaplaanile jätta. Vali tund, et näha üksikasju.</p>
        </div>
        <div className="sleg mono">N · R · L = neljapäev, reede, laupäev<br />number = kontakttunnid nädalas</div>
      </div>

      <div className="schips">
        <button className={"schipall" + (focus ? "" : " on")} onClick={() => setFocus(null)}>Kõik ained</button>
        {rows.map((r) => (
          <button key={r.key} className={"schipall" + (focus === r.key ? " on" : "")} aria-pressed={focus === r.key} onClick={() => toggleFocus(r.key)}>
            <span className="dot" style={{ background: r.color }} />{r.name}
          </button>
        ))}
      </div>

      <div className="timeline">
        <div className="tl-row tl-head">
          <div className="tl-name mono muted">AINE</div>
          {weeks.map((w, i) => (
            <button key={w.n} className={"tl-week" + (i === wi ? " on" : "")} aria-pressed={i === wi} onClick={() => goWeek(i)}>
              <div className="mono">{w.n}</div>
              <div className="mono muted small">{shortDate(w.days[0].iso)}</div>
            </button>
          ))}
          <div className="tl-total mono muted">tunde</div>
        </div>
        {rows.map((r) => {
          const cells = weeks.map((w) => weekCell(w, r.key));
          const total = cells.reduce((a, c) => a + c.hours, 0);
          return (
            <div key={r.key} className="tl-row" style={{ opacity: dim(r.key) ? 0.3 : 1 }}>
              <button className={"tl-name tl-subj" + (focus === r.key ? " on" : "")} onClick={() => toggleFocus(r.key)}>
                <span className="mostripe" style={{ background: r.color }} /><span className="ellip">{r.name}</span>
              </button>
              {cells.map((c, i) => (
                <button key={i} className={"tl-cell" + (i === wi ? " on" : "")} onClick={() => goWeek(i)}
                  title={c.hours ? `${r.name} · ${weeks[i].n}. nädal · ${c.hours} tundi` : undefined}
                  aria-label={`${r.name}, ${weeks[i].n}. nädal: ${c.hours} tundi`}
                  style={{ background: c.hours ? tint(r.color, 18) : "transparent" }}>
                  <span className="mono">{c.hours || ""}</span>
                  <span className="tl-days">{c.days.map((on, k) => <i key={k} style={{ background: on ? r.color : "var(--line)" }} />)}</span>
                </button>
              ))}
              <div className="tl-total mono">{total}</div>
            </div>
          );
        })}
      </div>

      <div className="weekview">
        <div className="wk-head">
          <button className="wk-nav" aria-label="Eelmine nädal" disabled={wi === 0} onClick={() => goWeek(wi - 1)}>‹</button>
          <button className="wk-nav" aria-label="Järgmine nädal" disabled={wi === weeks.length - 1} onClick={() => goWeek(wi + 1)}>›</button>
          <h2>{week.n}. nädal</h2>
          <span className="mono muted">
            {shortDate(week.days[0].iso)} – {shortDate(week.days[week.days.length - 1].iso)} · {totalHours} tundi · {new Set(all.map((s) => s.key)).size} ainet
          </span>
        </div>
        {notes.length > 0 && <div className="notes wk-notes">{notes.map((n) => <div key={n} className="note"><b>!</b><span>{n}</span></div>)}</div>}

        <div className="wk-grid">
          <div className="wk-days">
            <div />
            {DAYS.map((dn) => {
              const d = week.days.find((x) => x.name === dn);
              return <div key={dn} className="wk-dayhead" style={{ opacity: d ? 1 : 0.4 }}><b>{dn}</b><span className="mono muted">{d ? shortDate(d.iso) : "—"}</span></div>;
            })}
            <div className="wk-axis" style={{ height: axisH }}>
              {hours.map((h) => <span key={h.label} className="mono muted" style={{ top: h.top }}>{h.label}</span>)}
            </div>
            {DAYS.map((dn) => {
              const d = week.days.find((x) => x.name === dn);
              return (
                <div key={dn} className="wk-col" style={{ height: axisH }}>
                  {hours.map((h) => <i key={h.label} className="wk-line" style={{ top: h.top }} />)}
                  {(d?.sessions || []).map((s) => {
                    const top = (toMinutes(s.start) - range.start) * PX_PER_MIN;
                    const on = sel && s.id === sel.id;
                    return (
                      <button key={s.id} className={"wk-block" + (on ? " on" : "")} onClick={() => setSelId(s.id)}
                        style={{ top, height: (toMinutes(s.end) - toMinutes(s.start)) * PX_PER_MIN - 2, background: tint(s.color, on ? 25 : 12),
                          borderColor: on ? "var(--ink)" : tint(s.color, 33), opacity: dim(s.key) ? 0.3 : 1 }}>
                        <span className="mostripe" style={{ background: s.color }} />
                        <span className="mono bt">{s.start}–{s.end} · {s.hours}h</span>
                        <span className="bn">{s.name}</span>
                        <span className="bs">{[s.teacher || "õppejõud puudub", s.room].filter(Boolean).join(" · ")}</span>
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {sel && (
            <aside className="wk-side" aria-label="Tunni detailid">
              <div className="sesscard">
                <span className="mostripe wide" style={{ background: sel.color }} />
                <div className="mono muted">{sel.label || "Sissejuhatav üritus"}</div>
                <h3>{sel.name}</h3>
                <dl>
                  <dt>Aeg</dt><dd>{sel.day}, {longDate(sel.iso)} · {sel.start}–{sel.end}</dd>
                  <dt>Õppejõud</dt><dd className={sel.teacher ? "" : "missing"}>{sel.teacher || "Määramata"}</dd>
                  <dt>Maht</dt><dd>{sel.hours} tundi</dd>
                  <dt>Koht</dt><dd className={sel.room ? "" : "missing"}>{sel.room || "Määramata"}</dd>
                </dl>
                {sel.note && <div className="sessnote">{sel.note}</div>}
              </div>
              <div>
                <div className="label">Samal päeval teised ained</div>
                {others.map((o) => (
                  <button key={o.id} className="other" onClick={() => setSelId(o.id)}>
                    <span className="dot" style={{ background: o.color }} /><span className="mono muted">{o.start}–{o.end}</span><span>{o.name}</span>
                  </button>
                ))}
                {!others.length && <div className="muted">Selles päevas on ainult see tund.</div>}
              </div>
              <div className="topics">
                <div className="label">Tunni teemad</div>
                <p>Siia tuleb õppejõu lisatud teemade loetelu. Teised õppejõud näevad, mida millal käsitletakse.</p>
                <div className="label">Seotud õpiväljundid</div>
                <p>Iga teema seotakse aine väljundiga ja sealt edasi õppekava ÕV-ga. Seos kuvatakse siin ja Õpiväljundite maatriksis.</p>
                <button disabled>+ Lisa teema</button>
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SchedulePage() {
  const { palette, year } = useCurriculum();
  const json = schedules[year];
  if (!json) {
    return (
      <div className="schedule">
        <div className="ohead"><div><h1>Millal mis ainet õpetatakse?</h1><p>{year}. aasta ajakava andmeid pole. Ajakava on olemas: {Object.keys(schedules).join(", ")}.</p></div></div>
      </div>
    );
  }
  return <Schedule key={year} json={json} palette={palette} />;
}
