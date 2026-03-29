import { Component, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-loan-simulator',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './loan-simulator.component.html',
  styleUrls: ['./loan-simulator.component.scss']
})
export class LoanSimulatorComponent {
  // Inputs
  propertyPrice = signal(350000);
  downPayment = signal(70000);
  duration = signal(20);
  interestRate = signal(3.8);
  insuranceRate = signal(0.22);
  targetMonthly: number | null = null;
  affordableAmount = signal<number | null>(null);
  isNewProperty = signal(false);

  durations = [10, 15, 20, 25];

  // Computed values
  loanAmount = computed(() => Math.max(0, this.propertyPrice() - this.downPayment()));

  downPaymentPercent = computed(() =>
    this.propertyPrice() > 0 ? (this.downPayment() / this.propertyPrice()) * 100 : 0
  );

  monthlyPayment = computed(() => {
    const principal = this.loanAmount();
    const r = this.interestRate() / 100 / 12;
    const n = this.duration() * 12;
    if (r === 0) return principal / n;
    return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  });

  monthlyInsurance = computed(() =>
    (this.loanAmount() * this.insuranceRate() / 100) / 12
  );

  monthlyPaymentTotal = computed(() => this.monthlyPayment() + this.monthlyInsurance());

  totalPaid = computed(() => this.monthlyPaymentTotal() * this.duration() * 12);
  totalInterest = computed(() => (this.monthlyPayment() * this.duration() * 12) - this.loanAmount());
  totalInsurance = computed(() => this.monthlyInsurance() * this.duration() * 12);
  totalCost = computed(() => this.totalInterest() + this.totalInsurance());

  capitalPercent = computed(() => {
    const total = this.loanAmount() + this.totalCost();
    return total > 0 ? (this.loanAmount() / total) * 100 : 0;
  });
  interestPercent = computed(() => {
    const total = this.loanAmount() + this.totalCost();
    return total > 0 ? (this.totalInterest() / total) * 100 : 0;
  });
  insurancePercent = computed(() => {
    const total = this.loanAmount() + this.totalCost();
    return total > 0 ? (this.totalInsurance() / total) * 100 : 0;
  });

  notaryFees = computed(() => {
    const rate = this.isNewProperty() ? 0.025 : 0.075;
    return this.propertyPrice() * rate;
  });

  amortizationMilestones = computed(() => {
    const n = this.duration() * 12;
    const r = this.interestRate() / 100 / 12;
    const pmt = this.monthlyPayment();
    const principal = this.loanAmount();
    const milestones: { year: number; remaining: number; capitalPaidPercent: number }[] = [];
    const checkYears = [1, 5, 10, 15, 20, 25].filter(y => y <= this.duration());

    for (const year of checkYears) {
      const month = year * 12;
      if (month > n) break;
      let remaining = principal;
      for (let m = 0; m < month; m++) {
        const interest = remaining * r;
        const capital = pmt - interest;
        remaining -= capital;
      }
      remaining = Math.max(0, remaining);
      const capitalPaidPercent = ((principal - remaining) / principal) * 100;
      milestones.push({ year, remaining: Math.round(remaining), capitalPaidPercent });
    }
    return milestones;
  });

  calcAffordability(): void {
    if (!this.targetMonthly || this.targetMonthly <= 0) return;
    const netMonthly = this.targetMonthly - (this.loanAmount() * this.insuranceRate() / 100 / 12);
    const r = this.interestRate() / 100 / 12;
    const n = this.duration() * 12;
    let amount: number;
    if (r === 0) {
      amount = netMonthly * n;
    } else {
      amount = (netMonthly * (Math.pow(1 + r, n) - 1)) / (r * Math.pow(1 + r, n));
    }
    this.affordableAmount.set(Math.round(Math.max(0, amount)));
  }
}
