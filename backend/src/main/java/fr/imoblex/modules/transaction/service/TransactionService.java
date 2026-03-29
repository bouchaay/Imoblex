package fr.imoblex.modules.transaction.service;

import fr.imoblex.modules.contact.entity.Contact;
import fr.imoblex.modules.contact.repository.ContactRepository;
import fr.imoblex.modules.mandate.entity.Mandate;
import fr.imoblex.modules.mandate.repository.MandateRepository;
import fr.imoblex.modules.property.entity.Property;
import fr.imoblex.modules.property.repository.PropertyRepository;
import fr.imoblex.modules.transaction.dto.TransactionRequest;
import fr.imoblex.modules.transaction.dto.TransactionResponse;
import fr.imoblex.modules.transaction.entity.Transaction;
import fr.imoblex.modules.transaction.repository.TransactionRepository;
import fr.imoblex.modules.user.entity.User;
import fr.imoblex.modules.user.repository.UserRepository;
import fr.imoblex.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final PropertyRepository propertyRepository;
    private final ContactRepository contactRepository;
    private final MandateRepository mandateRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public Page<TransactionResponse> findAll(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return transactionRepository.findAll(pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public TransactionResponse findById(UUID id) {
        return transactionRepository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction introuvable: " + id));
    }

    public TransactionResponse create(TransactionRequest req) {
        Transaction t = new Transaction();
        mapRequestToTransaction(req, t);
        return toResponse(transactionRepository.save(t));
    }

    public TransactionResponse update(UUID id, TransactionRequest req) {
        Transaction t = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction introuvable: " + id));
        mapRequestToTransaction(req, t);
        return toResponse(transactionRepository.save(t));
    }

    public void delete(UUID id) {
        if (!transactionRepository.existsById(id)) throw new ResourceNotFoundException("Transaction introuvable: " + id);
        transactionRepository.deleteById(id);
    }

    private void mapRequestToTransaction(TransactionRequest req, Transaction t) {
        Property property = propertyRepository.findById(req.getPropertyId())
                .orElseThrow(() -> new ResourceNotFoundException("Bien introuvable: " + req.getPropertyId()));
        t.setProperty(property);
        if (req.getMandateId() != null) {
            Mandate mandate = mandateRepository.findById(req.getMandateId()).orElse(null);
            t.setMandate(mandate);
        }
        if (req.getBuyerId() != null) {
            Contact buyer = contactRepository.findById(req.getBuyerId()).orElse(null);
            t.setBuyer(buyer);
        }
        if (req.getSellerId() != null) {
            Contact seller = contactRepository.findById(req.getSellerId()).orElse(null);
            t.setSeller(seller);
        }
        if (req.getAgentId() != null) {
            User agent = userRepository.findById(req.getAgentId()).orElse(null);
            t.setAgent(agent);
        }
        t.setStatus(req.getStatus());
        t.setOfferPrice(req.getOfferPrice());
        t.setAgreedPrice(req.getAgreedPrice());
        t.setAgencyFees(req.getAgencyFees());
        t.setNetSellerPrice(req.getNetSellerPrice());
        t.setOfferDate(req.getOfferDate());
        t.setAcceptanceDate(req.getAcceptanceDate());
        t.setCompromisDate(req.getCompromisDate());
        t.setActeDate(req.getActeDate());
        t.setCompletionDate(req.getCompletionDate());
        t.setNotaryBuyer(req.getNotaryBuyer());
        t.setNotarySeller(req.getNotarySeller());
        t.setNotaryOffice(req.getNotaryOffice());
        t.setLoanCondition(req.getLoanCondition());
        t.setLoanAmount(req.getLoanAmount());
        t.setLoanDurationMonths(req.getLoanDurationMonths());
        t.setLoanRate(req.getLoanRate());
        t.setNotes(req.getNotes());
    }

    private TransactionResponse toResponse(Transaction t) {
        return TransactionResponse.builder()
                .id(t.getId())
                .propertyId(t.getProperty() != null ? t.getProperty().getId() : null)
                .propertyReference(t.getProperty() != null ? t.getProperty().getReference() : null)
                .propertyAddress(t.getProperty() != null ? t.getProperty().getAddress() + ", " + t.getProperty().getCity() : null)
                .mandateId(t.getMandate() != null ? t.getMandate().getId() : null)
                .buyerId(t.getBuyer() != null ? t.getBuyer().getId() : null)
                .buyerName(t.getBuyer() != null ? t.getBuyer().getFullName() : null)
                .sellerId(t.getSeller() != null ? t.getSeller().getId() : null)
                .sellerName(t.getSeller() != null ? t.getSeller().getFullName() : null)
                .agentId(t.getAgent() != null ? t.getAgent().getId() : null)
                .agentName(t.getAgent() != null ? t.getAgent().getFullName() : null)
                .status(t.getStatus())
                .offerPrice(t.getOfferPrice())
                .agreedPrice(t.getAgreedPrice())
                .agencyFees(t.getAgencyFees())
                .netSellerPrice(t.getNetSellerPrice())
                .offerDate(t.getOfferDate())
                .acceptanceDate(t.getAcceptanceDate())
                .compromisDate(t.getCompromisDate())
                .acteDate(t.getActeDate())
                .completionDate(t.getCompletionDate())
                .notaryBuyer(t.getNotaryBuyer())
                .notarySeller(t.getNotarySeller())
                .notaryOffice(t.getNotaryOffice())
                .loanCondition(t.getLoanCondition())
                .loanAmount(t.getLoanAmount())
                .loanDurationMonths(t.getLoanDurationMonths())
                .loanRate(t.getLoanRate())
                .notes(t.getNotes())
                .createdAt(t.getCreatedAt())
                .updatedAt(t.getUpdatedAt())
                .build();
    }
}
