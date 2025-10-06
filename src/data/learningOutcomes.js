const learningOutcomes = {
  curriculum: {
    id: 1,
    name: 'Rakendusinformaatika',
    objective: '',
    learningOutcomes: [],
  },
  modules: [
    {
      id: 1,
      name: 'Praktika',
      objective: 'Mooduli läbinud üliõpilasel on terviklikud teadmised ja praktilised oskused digilahenduste loomiseks ning valdkondliku uurimistöö läbiviimiseks.',
      learningOucomes: [
        {
          id: 1,
          description: 'Analüüsib üksikisiku, organisatsiooni või kogukonna probleemi, kavandab ja viib läbi vajalikud uuringud ning kogutud andmete põhjal loob digilahenduse või selle prototüübi, kasutades agiilse tarkvaraarenduse ja disaini meetodeid.',
        },
        {
          id: 2,
          description: 'Vastavalt projekti oodatavale tulemusele püstitab eesmärgid, kasutab versioonihaldust ning projektijuhtimise tööriistu ja reflekteerib protsessi.',
        },
        {
          id: 3,
          description: 'Tagab lahenduse kasutajakesksuse, turvalisuse ja kestlikkuse rakendades kasutajakeskse disaini, küberturbe ja tarkvaraarenduse praktikaid.',
        },
        {
          id: 4,
          description: 'Kommunikeerib eesmärke, protsessi ja tulemusi sidusrühmadele, kohandades sõnumeid eri kultuuri- ja sidusrühmadele ning kasutades visuaalseid ja andmepõhiseid esitusviise ning kogub ja võtab arvesse tagasisidet.',
        },
        {
          id: 5,
          description: 'Näitab üles initsiatiivi individuaal- ja meeskonnatöös, täites ülesandeid vastutustundlikult, loovalt ja eetiliselt.',
        },
        {
          id: 6,
          description: 'Tuleb toime võimalike pingeolukordadega, arvestades nii enda kui meeskonnakaaslaste füüsilist ja vaimset tervist mõjutavaid tegureid.',
        },
      ],
    },

    {
      id: 2,
      name: 'Üleülikoolilised ained',
      objective: 'Mooduli läbinud üliõpilasel on integreeritud teadmised psühholoogiast,  akadeemiline lugemis- ja kirjutamisoskus ning oskus rakendada projekti- ja meeskonnatöö põhimõtteid. Ta planeerib oma õpi- ja erialast tegevust eesmärgipäraselt, ennastjuhtivalt ja kriitiliselt mõeldes.',
      learningOucomes: [
        {
          id: 1,
          description: 'omab akadeemilist lugemis- ja kirjaoskust erialaste õpingute edukaks sooritamiseks'
        },
        {
          id: 2,
          description: 'eesmärgistab, planeerib ja analüüsib õppetöö ning erialase valdkonnaga seotud protsesse'
        },
        {
          id: 3,
          description: 'seostab psühholoogia eri suundi nende rakendusvõimalustega, analüüsides inimkäitumise, õppimise ja ühiskondlike protsesside vahelisi seoseid;'
        },
        {
          id: 4,
          description: 'lahendab interdistsiplinaarseid probleeme, tegutsedes nii meeskonnas kui iseseisvalt, leides seoseid eri valdkondade vahel.'
        },
      ],
    },

    {
      id: 3,
      name: 'Eriala kohustuslikud ained',
      objective: 'Mooduli läbinud üliõpilasel on terviklikud teadmised ja praktilised oskused digilahenduste loomiseks ning valdkondliku uurimistöö läbiviimiseks.',
      learningOucomes: [
        {
          id: 1,
          description: 'Selgitab, rakendab ja kommunikeerib valdkonna põhimõisteid ja teoreetilisi lähtekohti ning arengusuundi.'
        },
        {
          id: 2,
          description: 'Kasutab disaini-, tarkvaraarenduse- ja multimeediumi tööriistu ning rakendusi turvaliselt ja eetiliselt.'
        },
        {
          id: 3,
          description: 'Kavandab, disainib, arendab ja testib agiilselt digilahendusi, mis on kasutajakesksed, kestlikud, turvalised ja visuaalselt atraktiivsed.'
        },
        {
          id: 4,
          description: 'Analüüsib lahenduse kestlikkust ning keskkonna- ja ühiskonnamõju, langetab ja dokumenteerib otsuseid andmepõhiselt ning vastutustundlikult.'
        },
        {
          id: 5,
          description: 'Viib läbi uurimistööd, analüüsib andmeid ning rakendab teaduslikke meetodeid tarkvaraarenduse ja disaini kontekstis.'
        },
      ],
    },

    {
      id: 4,
      name: 'Eriala valikained',
      objective: 'Õpilane süvendab teadmisi ja oskusi valdkonna spetsiifilistes või uudsetes teemades.',
      learningOucomes: [
        {
          id: 1,
          description: 'Analüüsib ja teeb põhjendatud valiku valdkonnaspetsiifilise või uudse lähenemisviisi osas,  seostab oma valiku teoreetiliste käsitluste ja praktiliste rakendustega.'
        },
        {
          id: 2,
          description: 'Rakendab omandatud teadmisi ja oskusi praktilistes disaini- või tarkvaraarenduse projektides.'
        },
        {
          id: 3,
          description: 'Demonstreerib praktiliste ülesannete täitmisel loovust ja probleemilahendusoskusi.'
        },
      ],
    },

    {
      id: 5,
      name: 'Vabaained',
      objective: 'Üliõpilane leiab võimalusi enesearenguks lähtudes individuaalsest huvist ja arendab oma võõrkeele- ja arvutikasutamise oskusi.',
      learningOucomes: [
        {
          id: 1,
          description: 'süvendab erialaseid teadmisi ja oskusi;'
        },
        {
          id: 2,
          description: 'on tõstnud oma võõrkeeleoskuse vähemalt B1.2 tasemele;'
        },
        {
          id: 3,
          description: 'muu keelega kooli lõpetanu on tõstnud eesti keele oskuse C1 tasemele'
        },
      ],
    },

    {
      id: 6,
      name: 'Erialane inglise keel',
      objective: 'Õpilane arendab oma erialast inglise keelt.',
      learningOucomes: [
        {
          id: 1,
          description: 'Kasutab erialast inglisekeelset terminoloogiat.'
        },
        {
          id: 2,
          description: 'Mõistab ja koostab erialaseid inglisekeelseid tekste.'
        },
        {
          id: 3,
          description: 'Väljendab ladusalt suuliselt ja kirjalikult inglise keeles oma seisukohti.'
        },
      ],
    },

    {
      id: 7,
      name: 'Lõputöö',
      objective: 'Üliõpilane viib läbi erialase uurimuse, analüüsib uurimistulemusi, vormistab tulemuse lõputööks ja kaitseb valminud lõputööd.',
      learningOucomes: [
        {
          id: 1,
          description: 'Analüüsib erialast kirjandust, hinnates allikate akadeemilisust ja valdkondlikku autoriteeti.'
        },
        {
          id: 2,
          description: 'Tuvastab ja analüüsib ühiskonna, organisatsiooni või üksikisiku probleemi.'
        },
        {
          id: 3,
          description: 'Valib uurimistöö eesmärgi saavutamiseks sobivad uurimismeetodid, kogub ja analüüsib andmeid eetiliselt ja turvaliselt ning eristab fakte arvamusest.'
        },
        {
          id: 4,
          description: 'Kirjutab analüütilisel teemakäsitlusel põhineva lõputöö ja esitleb selle tulemusi.'
        },
        {
          id: 5,
          description: 'Hindab oma uurimistöö tulemuste keskkonna- ja ühiskonnamõju ning kestlikkust.'
        },
      ],
    }
  ],
};

export default learningOutcomes;