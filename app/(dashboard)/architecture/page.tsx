import {
  Activity,
  Database,
  Eye,
  Network,
  Server,
  ShieldCheck,
  Thermometer,
} from "lucide-react";

const chain = [
  {
    title: "Capteurs",
    detail: "Temperature, humidite, tension AC, eau, fumee",
    icon: Thermometer,
  },
  {
    title: "Gateway Black Box",
    detail: "EME168A : centralisation des sondes",
    icon: Server,
  },
  {
    title: "SNMPv3 authPriv",
    detail: "Flux securise vers Zabbix en UDP/161",
    icon: ShieldCheck,
  },
  {
    title: "Zabbix Server",
    detail: "Items, templates, triggers et alertes",
    icon: Activity,
  },
  {
    title: "PostgreSQL / TimescaleDB",
    detail: "Historique et series temporelles",
    icon: Database,
  },
  {
    title: "AURION",
    detail: "Lecture API JSON-RPC cote serveur",
    icon: Eye,
  },
];

export default function ArchitecturePage() {
  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">
            Architecture de supervision
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-white">
            De la salle serveur a l'exploitation DSI
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
            Cette vue explique le fonctionnement d'exploitation : les capteurs remontent
            les mesures a Zabbix, puis AURION les presente dans une interface lisible
            pour les techniciens DSI.
          </p>
        </header>

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3 xl:grid-cols-6">
            {chain.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="relative rounded-xl border border-white/10 bg-black/20 p-4">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-200">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="text-xs font-mono text-slate-500">0{index + 1}</p>
                  <h2 className="mt-1 text-sm font-semibold text-white">{step.title}</h2>
                  <p className="mt-2 text-xs leading-5 text-slate-500">{step.detail}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="mb-3 text-lg font-semibold text-white">Principe important</h2>
            <p className="text-sm leading-6 text-slate-400">
              AURION ne parle pas directement aux capteurs. Les capteurs sont collectes
              par la gateway Black Box, puis Zabbix devient la source de verite pour les
              mesures, les seuils, les triggers, les historiques et les alertes.
            </p>
            <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm leading-6 text-emerald-50/90">
              Le site DEMO-LAB reprend la meme chaine a petite echelle. Il sert a valider
              les capteurs et les triggers sans toucher aux sites pilotes HTDV et PLDS.
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-white">
              <Network className="h-5 w-5 text-cyan-300" />
              Flux a retenir
            </h2>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="rounded-xl border border-white/10 bg-black/20 p-3">
                <strong className="text-white">SNMPv3 :</strong> Zabbix interroge la Black Box en UDP/161.
              </li>
              <li className="rounded-xl border border-white/10 bg-black/20 p-3">
                <strong className="text-white">Base :</strong> Zabbix stocke l'historique dans PostgreSQL / TimescaleDB.
              </li>
              <li className="rounded-xl border border-white/10 bg-black/20 p-3">
                <strong className="text-white">AURION :</strong> l'application lit Zabbix via API JSON-RPC cote serveur.
              </li>
              <li className="rounded-xl border border-white/10 bg-black/20 p-3">
                <strong className="text-white">Securite :</strong> token API non expose au navigateur, comptes en lecture seule.
              </li>
            </ul>
          </div>
        </section>
      </div>
    </main>
  );
}
