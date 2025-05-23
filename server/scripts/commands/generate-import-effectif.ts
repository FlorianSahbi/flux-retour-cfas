import { writeFileSync } from "fs";

import { faker as fakerEn, Faker, fr } from "@faker-js/faker";
import { program, type Command } from "commander";
import { MongoClient } from "mongodb";
import { IFormationCatalogue } from "shared/models/data/formationsCatalogue.model";
import { IOrganisme } from "shared/models/data/organismes.model";
import { write, utils } from "xlsx";

const fakerFr = new Faker({ locale: [fr] });

function optional(data) {
  return fakerFr.helpers.arrayElement([data, ""]);
}

function fakeEffectif(formateur: IOrganisme, formation: IFormationCatalogue) {
  const lastName = fakerFr.person.lastName();
  const firstName = fakerFr.person.firstName();
  const anneeFormation = Number(formation.annee);
  const status = fakerFr.helpers.weightedArrayElement([
    { value: 0, weight: 1 },
    { value: 2, weight: 3 },
    { value: 3, weight: 10 },
  ]);

  const dateEntree = formation.date_debut?.at(-1) ?? null;
  const dateFin = formation.date_fin?.at(-1) ?? null;

  if (!dateEntree || !dateFin) {
    throw new Error('Formation "date_debut" or "date_fin" is missing');
  }

  const dateInscription = fakerFr.date.recent({
    days: 90,
    refDate: new Date(dateEntree),
  });

  return {
    nom_apprenant: lastName,
    prenom_apprenant: firstName,
    statut_apprenant: status,
    date_metier_mise_a_jour_statut: fakerFr.date.recent({ days: 30 }).toISOString().split("T").at(0),
    date_de_naissance_apprenant: fakerFr.date
      .birthdate({
        max: 25,
        min: 15,
        mode: "age",
      })
      .toISOString()
      .split("T")
      .at(0),
    sexe_apprenant: fakerFr.helpers.arrayElement(["M", "F"]),
    code_postal_de_naissance_apprenant: "",
    email_contact: fakerFr.internet.email({
      firstName,
      lastName,
      provider: "gmail.com",
    }),
    adresse_apprenant: fakerFr.location.streetAddress(),
    code_postal_apprenant: fakerFr.helpers.fromRegExp("[0-9]{5}"),
    ine_apprenant: optional(fakerFr.helpers.fromRegExp("[0-9]{10}[a-z]")),
    nir_apprenant: optional(fakerFr.helpers.fromRegExp("[0-9]{13}")),
    tel_apprenant: optional(fakerFr.helpers.fromRegExp("0[6-7][0-9]{8}")),
    rqth_apprenant: "",
    date_rqth_apprenant: "",
    responsable_apprenant_mail1: optional(
      fakerFr.internet.email({
        firstName: "responsable",
        provider: "gmail.com",
      })
    ),
    responsable_apprenant_mail2: "",
    dernier_organisme_uai: "",
    derniere_situation: "",
    etablissement_responsable_uai: formateur.organismesFormateurs?.[0]?.uai ?? formateur.uai,
    etablissement_responsable_siret: formateur.organismesFormateurs?.[0]?.siret ?? formateur.siret,
    etablissement_formateur_uai: formateur.uai,
    etablissement_formateur_siret: formateur.siret,
    etablissement_lieu_de_formation_uai: formateur.uai,
    etablissement_lieu_de_formation_siret: formateur.siret,
    etablissement_lieu_de_formation_adresse: fakerFr.location.streetAddress(),
    etablissement_lieu_de_formation_code_postal: fakerFr.helpers.fromRegExp("[0-9]{5}"),
    annee_scolaire: fakerFr.helpers.arrayElement(["2024-2025", "2025-2025"]),
    annee_formation: anneeFormation,
    formation_rncp: optional(formation.rncp_code),
    formation_cfd: formation.cfd,
    date_inscription_formation: dateInscription,
    date_entree_formation: new Date(dateEntree),
    date_fin_formation: new Date(dateFin),
    duree_theorique_formation_mois: Number(formation.duree) * 12,
    libelle_court_formation: formation.intitule_court ?? formation.intitule_long,
    obtention_diplome_formation: "",
    date_obtention_diplome_formation: "",
    date_exclusion_formation: "",
    cause_exclusion_formation: "",
    formation_presentielle: "",
    nom_referent_handicap_formation: "",
    prenom_referent_handicap_formation: "",
    email_referent_handicap_formation: "",
    contrat_date_debut: "",
    contrat_date_fin: "",
    siret_employeur: optional(fakerEn.helpers.replaceSymbolWithNumber("##############")),
    contrat_date_rupture: "",
    cause_rupture_contrat: "",
    contrat_date_debut_2: "",
    contrat_date_fin_2: "",
    siret_employeur_2: "",
    contrat_date_rupture_2: "",
    cause_rupture_contrat_2: "",
    contrat_date_debut_3: "",
    contrat_date_fin_3: "",
    siret_employeur_3: "",
    contrat_date_rupture_3: "",
    cause_rupture_contrat_3: "",
    contrat_date_debut_4: "",
    contrat_date_fin_4: "",
    siret_employeur_4: "",
    contrat_date_rupture_4: "",
    cause_rupture_contrat_4: "",
  };
}

export default function registerCommand(program: Command, getClient: () => MongoClient) {
  program
    .command("generate <siret>")
    .option("-c, --count <number>", "Count", "50")
    .option("-n, --name <string>", "Name", "import")
    .action(async (siret, { count, name }) => {
      const client = getClient();

      const formateur = await client.db("flux-retour-cfas").collection<IOrganisme>("organismes").findOne({ siret });

      if (formateur === null) {
        throw new Error("OF not found");
      }

      const formations: IFormationCatalogue[] = (await client
        .db("flux-retour-cfas")
        .collection("formationsCatalogue")
        .find({
          $and: [
            { published: true },
            {
              $or: [{ etablissement_formateur_siret: siret }, { etablissement_gestionnaire_siret: siret }],
            },
          ],
        })
        .toArray()) as any;

      if (formations.length === 0) {
        throw new Error("Formation not found");
      }

      const data: any[] = [];
      for (let i = 0; i < Number(count); i += 1) {
        data.push(fakeEffectif(formateur, fakerEn.helpers.arrayElement(formations)));
      }

      const worksheet = utils.json_to_sheet(data);
      const workbook = utils.book_new();
      utils.book_append_sheet(workbook, worksheet, "Sheet");

      writeFileSync(`./outputs/${name}.xlsx`, write(workbook, { type: "buffer" }));
    });
}

await program.parseAsync(process.argv);
