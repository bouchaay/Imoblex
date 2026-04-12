package fr.imoblex.modules.mandate.service;

import com.itextpdf.text.*;
import com.itextpdf.text.pdf.*;
import fr.imoblex.modules.agency.entity.AgencySettings;
import fr.imoblex.modules.agency.service.AgencySettingsService;
import fr.imoblex.modules.mandate.entity.Mandate;
import fr.imoblex.modules.mandate.repository.MandateRepository;
import fr.imoblex.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.nio.file.Paths;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class MandateDocumentService {

    private final MandateRepository mandateRepository;
    private final AgencySettingsService agencySettingsService;

    @Value("${imoblex.uploads.dir:./uploads}")
    private String uploadsDir;

    @Value("${imoblex.uploads.base-url:http://localhost:8080/api/uploads}")
    private String uploadsBaseUrl;

    private static final DateTimeFormatter DATE_FR = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    // ── Couleurs ──────────────────────────────────────────────────────────────
    private static final BaseColor C_NAVY     = new BaseColor(12,  38,  72);
    private static final BaseColor C_GREEN    = new BaseColor(22,  88,  38);
    private static final BaseColor C_DATA     = new BaseColor(10,  52, 115);
    private static final BaseColor C_GRAY_TXT = new BaseColor(90, 100, 115);
    private static final BaseColor C_BORDER   = new BaseColor(185, 195, 210);
    private static final BaseColor C_BG_LIGHT = new BaseColor(247, 249, 252);

    public byte[] generateGerance(UUID mandateId, boolean withSignature, String remiseDate, boolean blank) throws Exception {
        Mandate m = mandateRepository.findById(mandateId)
                .orElseThrow(() -> new ResourceNotFoundException("Mandat introuvable: " + mandateId));
        AgencySettings ag = agencySettingsService.getEntity();

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document doc = new Document(PageSize.A4, 28, 28, 20, 18);
        PdfWriter writer = PdfWriter.getInstance(doc, baos);
        doc.open();
        tryAddWatermarkLogo(writer, ag);

        // ── Polices ───────────────────────────────────────────────────────────
        BaseFont bfR = BaseFont.createFont(BaseFont.HELVETICA,          BaseFont.CP1252, false);
        BaseFont bfB = BaseFont.createFont(BaseFont.HELVETICA_BOLD,     BaseFont.CP1252, false);
        BaseFont bfI = BaseFont.createFont(BaseFont.HELVETICA_OBLIQUE,  BaseFont.CP1252, false);

        Font fTitleBig = new Font(bfB, 15f, Font.NORMAL, BaseColor.WHITE);
        Font fTitleSub = new Font(bfR,  7.5f, Font.NORMAL, new BaseColor(180, 210, 240));
        Font fNumRef   = new Font(bfB,  9f,   Font.NORMAL, new BaseColor(160, 210, 255));
        Font fSecLbl   = new Font(bfB,  8f,   Font.NORMAL, BaseColor.WHITE);
        Font fHeadLbl  = new Font(bfB, 10f,   Font.NORMAL, C_NAVY);
        Font fLabel    = new Font(bfR,  8.5f, Font.NORMAL, C_GRAY_TXT);
        Font fValue    = new Font(bfB,  9f,   Font.NORMAL, C_DATA);
        Font fValueUL  = new Font(bfB,  9f,   Font.UNDERLINE, C_DATA);
        Font fItalic   = new Font(bfI,  8f,   Font.NORMAL, C_GRAY_TXT);
        Font fBody     = new Font(bfR,  9f,   Font.NORMAL, new BaseColor(30, 35, 42));
        Font fBodyB    = new Font(bfB,  9f,   Font.NORMAL, new BaseColor(30, 35, 42));
        Font fSmall    = new Font(bfR,  7.5f, Font.NORMAL, new BaseColor(130, 140, 155));
        Font fSigLbl   = new Font(bfB,  9.5f, Font.NORMAL, C_NAVY);
        Font fSigItal  = new Font(bfI,  8f,   Font.NORMAL, C_GRAY_TXT);

        final float W     = 539f;
        final float LEAD  = 13f;
        final float LEADS = 10f;
        final float PAD   = 5f;
        final float LW    = 100f;

        // ── Barre décorative top ──────────────────────────────────────────────
        PdfPTable topBar = new PdfPTable(1);
        topBar.setTotalWidth(W);
        topBar.setLockedWidth(true);
        topBar.setSpacingAfter(5);
        PdfPCell barCell = new PdfPCell(new Phrase(" "));
        barCell.setBackgroundColor(C_NAVY);
        barCell.setFixedHeight(4f);
        barCell.setBorder(Rectangle.NO_BORDER);
        topBar.addCell(barCell);
        doc.add(topBar);

        // ── Données (vierge ou remplies) ──────────────────────────────────────
        final String BL  = "________________________";
        final String BLS = "_______________";
        String mandantName    = blank ? BL  : buildContactName(m);
        String mandantAddress = blank ? BL  : buildContactAddress(m);
        String agRepName      = blank ? BL  : safe(ag.getRepresentativeName());
        String cardNum        = blank ? BLS : safe(ag.getProfessionalCardNumber(), BLS);
        String prefecture     = blank ? BLS : safe(ag.getPrefecture(), BLS);
        String guarantee      = blank ? BLS : safe(ag.getGuaranteeAmount(), BLS);
        String insurer        = blank ? BLS : safe(ag.getGuaranteeInsurer(), BLS);

        // ── SECTION 1 : En-tête ───────────────────────────────────────────────

        PdfPTable header = new PdfPTable(new float[]{120, W - 120});
        header.setTotalWidth(W);
        header.setLockedWidth(true);
        header.setSpacingAfter(5);

        // Cellule gauche : titre
        PdfPCell titleCell = new PdfPCell();
        titleCell.setBackgroundColor(C_NAVY);
        titleCell.setPadding(PAD + 2);
        titleCell.setBorder(Rectangle.BOX);
        titleCell.setBorderColor(C_NAVY);
        titleCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        Paragraph titleP = new Paragraph();
        titleP.setLeading(18f);
        titleP.add(new Chunk("MANDAT\nDE\nGÉRANCE\n", fTitleBig));
        titleP.add(new Chunk("\n", new Font(bfR, 3f)));
        titleP.add(new Chunk("N°  " + (blank ? "______" : safe(m.getMandateNumber())) + "  (1)\n", fNumRef));
        titleP.add(new Chunk("\n", new Font(bfR, 3f)));
        titleP.add(new Chunk("Le mandat est obligatoire\n(art. 6 de la loi\ndu 2 janvier 1970)", fTitleSub));
        titleCell.addElement(titleP);
        header.addCell(titleCell);

        // Cellule droite : parties
        PdfPCell partiesCell = new PdfPCell();
        partiesCell.setBackgroundColor(C_BG_LIGHT);
        partiesCell.setPadding(PAD + 2);
        partiesCell.setBorder(Rectangle.BOX);
        partiesCell.setBorderColor(C_BORDER);

        Paragraph pP = new Paragraph();
        pP.setLeading(LEAD);
        pP.add(new Chunk("ENTRE LES SOUSSIGNÉS :\n\n", fHeadLbl));
        pP.add(new Chunk("M. ", fLabel));
        pP.add(new Chunk(mandantName, fValueUL));
        pP.add(new Chunk("   demeurant à  ", fLabel));
        pP.add(new Chunk(mandantAddress + "\n", fValue));
        pP.add(new Chunk("(propriétaire) dénommé ci-après \"le mandant\",  D'UNE PART,\n\n", fItalic));
        pP.add(new Chunk("Et M. ", fLabel));
        pP.add(new Chunk(!agRepName.isBlank() ? agRepName : "________________________", fValueUL));
        pP.add(new Chunk("\n", fBody));
        pP.add(new Chunk("Titulaire de la carte professionnelle n° ", fLabel));
        pP.add(new Chunk(cardNum, fValue));
        pP.add(new Chunk("   délivrée par la Préfecture de  ", fLabel));
        pP.add(new Chunk(prefecture + "\n", fValue));
        pP.add(new Chunk("dont la garantie pour un montant de  ", fLabel));
        pP.add(new Chunk(guarantee, fValue));
        pP.add(new Chunk("   est assurée par  ", fLabel));
        pP.add(new Chunk(insurer + "\n", fValue));
        pP.add(new Chunk("(administrateur de biens) dénommé ci-après \"le mandataire\",  D'AUTRE PART,", fItalic));
        partiesCell.addElement(pP);
        header.addCell(partiesCell);
        doc.add(header);

        // ── SECTION 2 : IL A ÉTÉ CONVENU ─────────────────────────────────────
        String propAddr = blank ? BL : buildPropertyAddress(m);
        PdfPTable convenu = new PdfPTable(1);
        convenu.setTotalWidth(W);
        convenu.setLockedWidth(true);
        convenu.setSpacingAfter(4);
        PdfPCell cCell = new PdfPCell();
        cCell.setPadding(PAD);
        cCell.setBorderColor(C_BORDER);
        cCell.setBackgroundColor(BaseColor.WHITE);
        Paragraph cP = new Paragraph();
        cP.setLeading(LEAD);
        cP.add(new Chunk("IL A ÉTÉ CONVENU CE QUI SUIT :\n", fHeadLbl));
        cP.add(new Chunk("M. ", fLabel));
        cP.add(new Chunk(mandantName, fValue));
        cP.add(new Chunk(" (propriétaire) donne par les présentes mandat à M. ", fBody));
        cP.add(new Chunk(!agRepName.isBlank() ? agRepName : "________________________", fValue));
        cP.add(new Chunk(" (administrateur de biens), qui accepte de gérer et administrer\n", fBody));
        cP.add(new Chunk("l'immeuble dont il est propriétaire à : ", fBody));
        cP.add(new Chunk(propAddr + "\n", fValue));
        cP.add(new Chunk("Le présent mandat sera régi par les dispositions des Articles 1984 à 2010 du Code Civil.", fBody));
        cCell.addElement(cP);
        convenu.addCell(cCell);
        doc.add(convenu);

        // ── DURÉE ─────────────────────────────────────────────────────────────
        String startStr  = blank ? "___/___/______" : (m.getStartDate() != null ? m.getStartDate().format(DATE_FR) : "___/___/______");
        String maxYearsS = blank ? "___" : String.valueOf(m.getMaxDurationYears() != null ? m.getMaxDurationYears() : 3);

        Paragraph dureeP = new Paragraph();
        dureeP.setLeading(LEAD);
        dureeP.add(new Chunk("LE PRÉSENT MANDAT EST DONNÉ À COMPTER DU  ", fBody));
        dureeP.add(new Chunk(startStr, fValue));
        dureeP.add(new Chunk("  POUR UNE DURÉE D'UNE ANNÉE,\n", fBody));
        dureeP.add(new Chunk("renouvelable par tacite reconduction par période de même durée dans la limite de  ", fBody));
        dureeP.add(new Chunk(maxYearsS + " années", fValue));
        dureeP.add(new Chunk(".\n", fBody));
        dureeP.add(new Chunk(
            "Chacune des parties pourra y mettre fin par lettre recommandée AR, "
            + "au moins trois mois avant l'expiration de chaque période annuelle.", fBody));
        doc.add(buildSection("DURÉE\nDU MANDAT", dureeP, fSecLbl, LW, W, PAD, LEAD));

        // ── OBLIGATIONS ───────────────────────────────────────────────────────
        Paragraph obliP = new Paragraph();
        obliP.setLeading(LEADS);
        obliP.add(new Chunk("Le présent mandat est donné par le mandant au mandataire aux conditions suivantes :\n", fBody));
        obliP.add(new Chunk("1) ", fBodyB));
        obliP.add(new Chunk("Obligation de faire parvenir au mandant (propriétaire) avant les ", fBody));
        obliP.add(new Chunk("15 février, 15 mai, 15 août et 15 novembre", fBodyB));
        obliP.add(new Chunk(
            " de chaque année, le compte détaillé de sa gestion, ainsi que les sommes dues, "
            + "par chèque bancaire, après déduction des honoraires.\n", fBody));
        obliP.add(new Chunk("2) ", fBodyB));
        obliP.add(new Chunk(
            "Obligation de ne pouvoir, pour quelque motif que ce soit, se substituer une autre personne, "
            + "fût-ce un autre Administrateur de biens, sans le consentement préalable et écrit du mandant.", fBody));
        doc.add(buildSection("OBLIGATIONS\nDU MANDATAIRE", obliP, fSecLbl, LW, W, PAD, LEADS));

        // ── POUVOIRS ──────────────────────────────────────────────────────────
        String[] col1 = {
            "louer, renouveler ou résilier les locations ;",
            "dresser tous états des lieux et exiger toutes réparations locatives ;",
            "donner et accepter tous congés ;",
            "percevoir des loyers, dépôts de garantie, pas de porte ;",
            "exercer contre les défaillants toutes actions judiciaires ou extrajudiciaires, transiger ;",
            "entretenir l'immeuble, passer tous marchés, faire tous appels d'offres ;"
        };
        String[] col2 = {
            "régler les factures et mémoires des entrepreneurs et fournisseurs ;",
            "conclure tout contrat d'abonnement, les modifier ou résilier ;",
            "contracter les assurances nécessaires, en payer les primes, les résilier ;",
            "embaucher et renvoyer le personnel d'entretien de l'immeuble ;",
            "délivrer toutes quittances, décharges, mains levées ;",
            "agir au mieux des intérêts du mandant."
        };

        float pouvoirW = W - LW - 2 * PAD;
        PdfPTable pouvoirCols = new PdfPTable(new float[]{pouvoirW / 2f, pouvoirW / 2f});
        pouvoirCols.setTotalWidth(pouvoirW);
        pouvoirCols.setLockedWidth(true);

        Paragraph pc1P = new Paragraph();
        pc1P.setLeading(LEADS);
        pc1P.add(new Chunk("Pour permettre au mandataire de remplir sa mission,\nle mandant lui donne pouvoir de :\n", fBody));
        for (String s : col1) pc1P.add(new Chunk("–  " + s + "\n", fBody));
        PdfPCell pc1 = new PdfPCell();
        pc1.setBorder(Rectangle.NO_BORDER);
        pc1.setPadding(0);
        pc1.addElement(pc1P);
        pouvoirCols.addCell(pc1);

        Paragraph pc2P = new Paragraph();
        pc2P.setLeading(LEADS);
        pc2P.add(new Chunk("\n\n", new Font(bfR, 9f)));
        for (String s : col2) pc2P.add(new Chunk("–  " + s + "\n", fBody));
        PdfPCell pc2 = new PdfPCell();
        pc2.setBorder(Rectangle.NO_BORDER);
        pc2.setPadding(0);
        pc2.addElement(pc2P);
        pouvoirCols.addCell(pc2);

        doc.add(buildSection("POUVOIRS\nDU MANDATAIRE", pouvoirCols, fSecLbl, LW, W, PAD, LEADS));

        // ── RÉMUNÉRATION ─────────────────────────────────────────────────────
        String feesText = blank ? BL : buildFeesText(m);
        Paragraph remuP = new Paragraph();
        remuP.setLeading(LEAD);
        remuP.add(new Chunk(
            "LES HONORAIRES, LIBREMENT CONVENUS ENTRE LES PARTIES À LA CHARGE DU MANDANT, "
            + "SONT FIXÉS COMME SUIT :\n", fBody));
        remuP.add(new Chunk(feesText, fValue));
        doc.add(buildSection("RÉMUNÉRATION", remuP, fSecLbl, LW, W, PAD, LEAD));

        // ── SIGNATURES ────────────────────────────────────────────────────────
        String sigPlace = blank ? BLS : safe(m.getSignedAtPlace(), safe(ag.getCity(), ""));
        String sigDate;
        if (blank) {
            sigDate = "";
        } else if (remiseDate != null && !remiseDate.isBlank()) {
            try { sigDate = java.time.LocalDate.parse(remiseDate).format(DATE_FR); }
            catch (Exception e) { sigDate = remiseDate; }
        } else if (m.getSignedAt() != null) {
            sigDate = m.getSignedAt().format(DATE_FR);
        } else {
            sigDate = "";
        }

        PdfPTable sigTable = new PdfPTable(new float[]{110, W - 110});
        sigTable.setTotalWidth(W);
        sigTable.setLockedWidth(true);
        sigTable.setSpacingBefore(3);
        sigTable.setSpacingAfter(2);

        PdfPCell appCell = new PdfPCell();
        appCell.setBackgroundColor(C_BG_LIGHT);
        appCell.setPadding(PAD);
        appCell.setBorderColor(C_BORDER);
        Paragraph appP = new Paragraph();
        appP.setLeading(10f);
        appP.add(new Chunk("Approuvant :\n\n_____ lignes\n_____ mots\nrayés nuls\n\n(Signatures)", fSmall));
        appCell.addElement(appP);
        sigTable.addCell(appCell);

        PdfPCell remisCell = new PdfPCell();
        remisCell.setBackgroundColor(C_BG_LIGHT);
        remisCell.setPadding(PAD + 2);
        remisCell.setBorderColor(C_BORDER);
        Paragraph remisP = new Paragraph();
        remisP.setLeading(LEAD);
        remisP.add(new Chunk("Un exemplaire du présent mandat a été remis ce jour au mandant.\n\n", fBody));
        remisP.add(new Chunk("A  ", fLabel));
        remisP.add(new Chunk(sigPlace, fValue));
        remisP.add(new Chunk(",  le  ", fLabel));
        if (!sigDate.isBlank()) remisP.add(new Chunk(sigDate, fValue));
        remisCell.addElement(remisP);
        sigTable.addCell(remisCell);
        doc.add(sigTable);

        // Blocs mandant / mandataire
        PdfPTable sigBlocks = new PdfPTable(new float[]{W / 2f, W / 2f});
        sigBlocks.setTotalWidth(W);
        sigBlocks.setLockedWidth(true);
        sigBlocks.setSpacingAfter(2);

        PdfPCell mandantSig = new PdfPCell();
        mandantSig.setPadding(PAD + 2);
        mandantSig.setBorderColor(C_BORDER);
        mandantSig.setMinimumHeight(72f);
        Paragraph msP = new Paragraph();
        msP.setLeading(LEAD);
        msP.add(new Chunk("LE MANDANT\n", fSigLbl));
        msP.add(new Chunk("\"Lu et Approuvé\", bon pour mandat", fSigItal));
        mandantSig.addElement(msP);
        sigBlocks.addCell(mandantSig);

        PdfPCell mandataireSig = new PdfPCell();
        mandataireSig.setPadding(PAD + 2);
        mandataireSig.setBorderColor(C_BORDER);
        mandataireSig.setMinimumHeight(72f);
        Paragraph mtP = new Paragraph();
        mtP.setLeading(LEAD);
        mtP.add(new Chunk("LE MANDATAIRE\n", fSigLbl));
        mtP.add(new Chunk("Mandat accepté\n", fSigItal));
        if (withSignature && !blank) tryAddSignature(ag, mtP);
        mandataireSig.addElement(mtP);
        sigBlocks.addCell(mandataireSig);
        doc.add(sigBlocks);

        // Note bas de page
        PdfPTable footer = new PdfPTable(new float[]{W / 2f, W / 2f});
        footer.setTotalWidth(W);
        footer.setLockedWidth(true);
        PdfPCell fn1 = noBorderCell(
            new Phrase("(1) Numéro identique à celui de l'inscription au registre des mandats.", fSmall));
        PdfPCell fn2 = noBorderCell(
            new Phrase("Signer séparément chaque exemplaire.", fSmall));
        fn2.setHorizontalAlignment(Element.ALIGN_RIGHT);
        footer.addCell(fn1);
        footer.addCell(fn2);
        doc.add(footer);

        doc.close();
        return baos.toByteArray();
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private PdfPTable buildSection(String label, Element content,
                                   Font labelFont, float lw, float totalW,
                                   float pad, float leading) throws DocumentException {
        PdfPTable table = new PdfPTable(new float[]{lw, totalW - lw});
        table.setTotalWidth(totalW);
        table.setLockedWidth(true);
        table.setSpacingAfter(2);

        PdfPCell lblCell = new PdfPCell();
        lblCell.setBackgroundColor(C_GREEN);
        lblCell.setPadding(pad);
        lblCell.setBorderColor(C_GREEN);
        lblCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        Paragraph lP = new Paragraph(label, labelFont);
        lP.setAlignment(Element.ALIGN_CENTER);
        lP.setLeading(11f);
        lblCell.addElement(lP);
        table.addCell(lblCell);

        PdfPCell cCell = new PdfPCell();
        cCell.setBackgroundColor(BaseColor.WHITE);
        cCell.setPadding(pad);
        cCell.setBorderColor(C_BORDER);
        if (content instanceof Paragraph) ((Paragraph) content).setLeading(leading);
        cCell.addElement(content);
        table.addCell(cCell);
        return table;
    }

    private PdfPCell noBorderCell(Phrase p) {
        PdfPCell c = new PdfPCell(p);
        c.setBorder(Rectangle.NO_BORDER);
        c.setPadding(1f);
        return c;
    }

    private void tryAddWatermarkLogo(PdfWriter writer, AgencySettings ag) {
        try {
            File logoFile = null;
            if (ag.getLogoPath() != null && !ag.getLogoPath().isBlank()) {
                logoFile = resolveSignatureFile(ag.getLogoPath());
            }
            if (logoFile == null || !logoFile.exists()) return;

            Image logo = Image.getInstance(logoFile.getAbsolutePath());
            float pageW = PageSize.A4.getWidth();
            float pageH = PageSize.A4.getHeight();
            logo.scaleToFit(pageW * 0.55f, pageH * 0.55f);
            logo.setAbsolutePosition(
                (pageW - logo.getScaledWidth())  / 2f,
                (pageH - logo.getScaledHeight()) / 2f
            );
            PdfContentByte canvas = writer.getDirectContentUnder();
            PdfGState gs = new PdfGState();
            gs.setFillOpacity(0.06f);
            gs.setStrokeOpacity(0.06f);
            canvas.saveState();
            canvas.setGState(gs);
            canvas.addImage(logo);
            canvas.restoreState();
        } catch (Exception e) {
            log.warn("Logo watermark introuvable: {}", e.getMessage());
        }
    }

    private void tryAddSignature(AgencySettings ag, Paragraph p) {
        if (ag.getSignatureImagePath() == null) return;
        try {
            File sigFile = resolveSignatureFile(ag.getSignatureImagePath());
            if (sigFile != null && sigFile.exists()) {
                Image sig = Image.getInstance(sigFile.getAbsolutePath());
                sig.scaleToFit(120, 45);
                p.add(new Chunk(sig, 0, -16));
            }
        } catch (Exception e) {
            log.warn("Signature image introuvable: {}", e.getMessage());
        }
    }

    private String buildContactName(Mandate m) {
        if (m.getMandator() == null) return "________________________";
        var c = m.getMandator();
        String sal = c.getSalutation() != null ? c.getSalutation() + " " : "";
        String fn  = c.getFirstName()  != null ? c.getFirstName()  + " " : "";
        String ln  = c.getLastName()   != null ? c.getLastName()         : "";
        String result = (sal + fn + ln).trim();
        return result.isBlank() ? "________________________" : result;
    }

    private String buildContactAddress(Mandate m) {
        if (m.getMandator() == null) return "________________________";
        var c = m.getMandator();
        StringBuilder sb = new StringBuilder();
        if (c.getAddress()    != null && !c.getAddress().isBlank())    sb.append(c.getAddress());
        if (c.getPostalCode() != null && !c.getPostalCode().isBlank()) { if (sb.length() > 0) sb.append(", "); sb.append(c.getPostalCode()); }
        if (c.getCity()       != null && !c.getCity().isBlank())       { if (sb.length() > 0) sb.append(" ");  sb.append(c.getCity()); }
        return sb.length() > 0 ? sb.toString() : "________________________";
    }

    private String buildPropertyAddress(Mandate m) {
        if (m.getProperty() == null) return "________________________";
        var p = m.getProperty();
        StringBuilder sb = new StringBuilder();
        if (p.getAddress()    != null) sb.append(p.getAddress());
        if (p.getCity()       != null) { if (sb.length() > 0) sb.append(", "); sb.append(p.getCity()); }
        if (p.getPostalCode() != null) { if (sb.length() > 0) sb.append(" ");  sb.append(p.getPostalCode()); }
        return sb.length() > 0 ? sb.toString() : "________________________";
    }

    private String buildFeesText(Mandate m) {
        if (m.getAgencyFeesText() != null && !m.getAgencyFeesText().isBlank())
            return m.getAgencyFeesText();
        if (m.getAgencyFeesPercent() != null)
            return String.format("%.2f", m.getAgencyFeesPercent()).replace(".", ",") + " % des loyers encaissés";
        if (m.getAgencyFees() != null)
            return String.format("%.2f", m.getAgencyFees()).replace(".", ",") + " € TTC";
        return "À définir entre les parties";
    }

    private File resolveSignatureFile(String path) {
        if (path == null || path.isBlank()) return null;
        if (path.startsWith(uploadsBaseUrl)) {
            String rel = path.substring(uploadsBaseUrl.length()).replaceFirst("^/", "");
            return Paths.get(uploadsDir, rel.replace("/", File.separator)).toFile();
        }
        return new File(path);
    }

    private String safe(String val) {
        return val != null && !val.isBlank() ? val : "";
    }

    private String safe(String val, String fallback) {
        return val != null && !val.isBlank() ? val : fallback;
    }
}
