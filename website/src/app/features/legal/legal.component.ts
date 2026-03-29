import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { BreadcrumbComponent } from '../../shared/components/breadcrumb.component';

type LegalPage = 'mentions-legales' | 'politique-confidentialite' | 'cookies';

interface Section {
  title: string;
  content: string;
}

interface PageContent {
  title: string;
  subtitle: string;
  updatedAt: string;
  sections: Section[];
}

@Component({
  selector: 'app-legal',
  standalone: true,
  imports: [CommonModule, RouterModule, BreadcrumbComponent],
  templateUrl: './legal.component.html',
  styleUrls: ['./legal.component.scss']
})
export class LegalComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  currentPath: LegalPage = 'mentions-legales';
  page: PageContent | null = null;

  breadcrumb: { label: string; path?: string }[] = [
    { label: 'Accueil', path: '/' },
    { label: 'Mentions légales' }
  ];

  private readonly pages: Record<LegalPage, PageContent> = {
    'mentions-legales': {
      title: 'Mentions légales',
      subtitle: 'Informations légales relatives au site imoblex.fr',
      updatedAt: '1er janvier 2025',
      sections: [
        {
          title: '1. Éditeur du site',
          content: `Le site imoblex.fr est édité par :

ANDRADE ALEIXO
Forme juridique : SARL
Capital social : 3 000 €
RCS Toulouse : 879 071 033 000 10
N° TVA intracommunautaire : FR 038 790 710 33
Siège social : 22 Rue Hyères, 31500 Toulouse (France)

Téléphone : 05.61.61.57.38 / 06.81.76.30.94
Email : contact@imoblex.fr`
        },
        {
          title: '2. Activité réglementée',
          content: `Imoblex exerce l'activité de transaction immobilière et de gestion locative sous le statut d'agent immobilier, activité soumise à la loi Hoguet n°70-9 du 2 janvier 1970.

Carte professionnelle : délivrée par la Chambre de Commerce et d'Industrie (CCI) de Toulouse Métropole.
Garantie financière : SOCAF – 110 000 €
Assurance Responsabilité Civile Professionnelle souscrite auprès d'un assureur agréé.`
        },
        {
          title: '3. Directeur de la publication',
          content: `Le directeur de la publication est le gérant de la société ANDRADE ALEIXO SARL.`
        },
        {
          title: '4. Hébergement',
          content: `Ce site est hébergé par un prestataire établi sur le territoire de l'Union Européenne, conformément à la réglementation en vigueur sur la protection des données personnelles (RGPD).`
        },
        {
          title: '5. Propriété intellectuelle',
          content: `L'ensemble des éléments constituant ce site (textes, graphismes, logiciels, photographies, images, sons, plans, noms, logos, marques, etc.) est la propriété exclusive d'Imoblex ou de ses partenaires, et est protégé par les dispositions du Code de la propriété intellectuelle.

Toute reproduction, représentation, modification, publication, adaptation totale ou partielle des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite, sauf autorisation écrite préalable d'Imoblex.`
        },
        {
          title: '6. Responsabilité',
          content: `Les informations et documents figurant sur ce site sont fournis à titre indicatif et peuvent être modifiés sans préavis. Imoblex s'efforce d'assurer l'exactitude et la mise à jour des informations diffusées, mais ne peut garantir l'exhaustivité ou la précision de ces informations.

Imoblex ne peut être tenu responsable des dommages directs ou indirects résultant de l'utilisation de ce site ou de l'impossibilité d'y accéder.`
        },
        {
          title: '7. Liens hypertextes',
          content: `Ce site peut contenir des liens vers d'autres sites internet. Imoblex n'est pas responsable du contenu de ces sites tiers et ne peut être tenu responsable des dommages résultant de l'utilisation de ces sites.`
        },
        {
          title: '8. Droit applicable',
          content: `Les présentes mentions légales sont régies par le droit français. En cas de litige, les tribunaux compétents sont ceux du ressort de Toulouse, sauf disposition légale contraire.`
        },
      ]
    },

    'politique-confidentialite': {
      title: 'Politique de confidentialité',
      subtitle: 'Protection de vos données personnelles – RGPD',
      updatedAt: '1er janvier 2025',
      sections: [
        {
          title: '1. Responsable du traitement',
          content: `ANDRADE ALEIXO SARL – 22 Rue Hyères, 31500 Toulouse
Email : contact@imoblex.fr
Téléphone : 05.61.61.57.38`
        },
        {
          title: '2. Données collectées',
          content: `Nous collectons les données suivantes dans le cadre de nos services :

• Données d'identification : nom, prénom, adresse postale, email, téléphone
• Données relatives à votre projet immobilier : type de bien recherché, budget, critères
• Données de navigation : adresse IP, pages visitées, durée de session (via cookies)
• Données de communication : messages envoyés via le formulaire de contact

Ces données sont collectées uniquement avec votre consentement explicite ou dans le cadre de l'exécution d'un contrat ou d'une obligation légale.`
        },
        {
          title: '3. Finalités du traitement',
          content: `Vos données sont utilisées pour :

• Répondre à vos demandes de renseignements et organiser des visites
• Vous proposer des biens correspondant à votre recherche (alertes immobilières)
• Établir et exécuter les mandats, compromis et autres contrats immobiliers
• Respecter nos obligations légales (loi Hoguet, TRACFIN, etc.)
• Améliorer nos services et l'expérience utilisateur de notre site`
        },
        {
          title: '4. Durée de conservation',
          content: `• Prospects / contacts : 3 ans à compter du dernier contact
• Clients (transaction ou gestion) : 10 ans à compter de la fin de la relation contractuelle
• Données de navigation : 13 mois maximum
• Candidatures locatives : 3 mois si dossier non retenu, durée du contrat + 3 ans si accepté`
        },
        {
          title: '5. Destinataires des données',
          content: `Vos données sont traitées par les collaborateurs d'Imoblex dans le cadre strict de leur mission. Elles peuvent être transmises à :

• Notaires, experts immobiliers dans le cadre d'une transaction
• Établissements bancaires avec votre accord (dans le cadre d'un financement)
• Organismes publics sur demande légale (administration fiscale, TRACFIN)

Aucune donnée n'est vendue ou cédée à des tiers à des fins commerciales.`
        },
        {
          title: '6. Vos droits (RGPD)',
          content: `Conformément au Règlement Général sur la Protection des Données (UE 2016/679), vous disposez des droits suivants :

• Droit d'accès à vos données personnelles
• Droit de rectification en cas d'inexactitude
• Droit à l'effacement (« droit à l'oubli ») sous réserve d'obligations légales
• Droit d'opposition au traitement pour des motifs légitimes
• Droit à la portabilité de vos données
• Droit de retrait du consentement à tout moment

Pour exercer ces droits, contactez-nous par email à contact@imoblex.fr ou par courrier à notre adresse. Vous pouvez également introduire une réclamation auprès de la CNIL (www.cnil.fr).`
        },
        {
          title: '7. Sécurité',
          content: `Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données contre tout accès non autorisé, divulgation, altération ou destruction. Le site est servi en HTTPS et les accès aux données sont strictement contrôlés.`
        },
      ]
    },

    'cookies': {
      title: 'Gestion des cookies',
      subtitle: 'Utilisation des cookies sur imoblex.fr',
      updatedAt: '1er janvier 2025',
      sections: [
        {
          title: "1. Qu'est-ce qu'un cookie ?",
          content: `Un cookie est un petit fichier texte déposé sur votre terminal (ordinateur, smartphone, tablette) lors de votre navigation sur notre site. Il permet de mémoriser des informations relatives à votre visite et d'améliorer votre expérience utilisateur.`
        },
        {
          title: '2. Cookies utilisés sur imoblex.fr',
          content: `Nous utilisons les catégories de cookies suivantes :

Cookies strictement nécessaires (obligatoires)
Ces cookies sont indispensables au fonctionnement du site. Ils ne peuvent pas être désactivés. Ils permettent la navigation, la mémorisation de votre session et la sécurité du site.

Cookies de performance / analytiques (avec consentement)
Ces cookies nous permettent de mesurer l'audience du site (pages les plus visitées, temps passé, erreurs rencontrées) afin d'améliorer nos services. Les données sont anonymisées et ne permettent pas de vous identifier.

Cookies fonctionnels (avec consentement)
Ces cookies mémorisent vos préférences (type de recherche, critères de filtrage, alertes immobilières) pour vous offrir une expérience personnalisée.`
        },
        {
          title: '3. Durée de conservation des cookies',
          content: `• Cookies de session : supprimés à la fermeture du navigateur
• Cookies persistants : conservés au maximum 13 mois, conformément aux recommandations de la CNIL`
        },
        {
          title: '4. Gestion de votre consentement',
          content: `Lors de votre première visite, un bandeau vous informe de la présence de cookies et vous permet d'accepter ou de refuser leur dépôt par catégorie.

Vous pouvez à tout moment modifier vos préférences en cliquant sur « Gérer mes cookies » en bas de page, ou en configurant votre navigateur.

Instructions par navigateur :
• Chrome : Paramètres > Confidentialité et sécurité > Cookies
• Firefox : Options > Vie privée et sécurité > Cookies
• Safari : Préférences > Confidentialité > Cookies
• Edge : Paramètres > Cookies et autorisations du site`
        },
        {
          title: '5. Cookies tiers',
          content: `Notre site peut intégrer des services tiers susceptibles de déposer leurs propres cookies (cartographie, vidéos embarquées, partage social). Ces cookies sont soumis aux politiques de confidentialité de leurs éditeurs respectifs. Nous n'avons pas de contrôle direct sur ces cookies.`
        },
        {
          title: '6. Contact',
          content: `Pour toute question relative à l'utilisation des cookies sur notre site, vous pouvez nous contacter à :
contact@imoblex.fr
22 Rue Hyères, 31500 Toulouse
Tél. : 05.61.61.57.38`
        },
      ]
    }
  };

  ngOnInit(): void {
    this.route.url.subscribe(segments => {
      const path = segments[0]?.path as LegalPage;
      if (path && this.pages[path]) {
        this.currentPath = path;
        this.page = this.pages[path];
        this.breadcrumb = [
          { label: 'Accueil', path: '/' },
          { label: this.page.title }
        ];
      } else {
        this.router.navigate(['/mentions-legales']);
      }
    });
  }
}
