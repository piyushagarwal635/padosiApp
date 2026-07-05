import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { WorkerService } from '../../../core/services/worker.service';

@Component({
  selector: 'app-worker-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './worker-dashboard.html',
  styleUrls: ['./worker-dashboard.css']
})
export class WorkerDashboard implements OnInit {
  currentTab: 'home' | 'leads' | 'wallet' | 'profile' = 'home';
  
  profile: any = null;
  wallet: { balance: number, transactions: any[] } = { balance: 0, transactions: [] };
  jobs: { pending: any[], active: any[] } = { pending: [], active: [] };

  constructor(
    private authService: AuthService,
    private workerService: WorkerService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadProfile();
    this.loadJobs();
    this.loadWallet();
  }

  setTab(tab: 'home' | 'leads' | 'wallet' | 'profile') {
    this.currentTab = tab;
    // Reload data dynamically when switching tabs
    if (tab === 'leads') this.loadJobs();
    if (tab === 'wallet') this.loadWallet();
    if (tab === 'profile') this.loadProfile();
  }

  loadProfile() {
    this.workerService.getProfile().subscribe({
      next: (res) => {
        if (res.success) {
          this.profile = res.data;
          this.cdr.detectChanges();
        }
      },
      error: (err) => console.error(err)
    });
  }

  loadJobs() {
    this.workerService.getJobs().subscribe({
      next: (res) => {
        if (res.success) {
          this.jobs = { pending: res.pendingJobs, active: res.activeJobs };
          this.cdr.detectChanges();
        }
      },
      error: (err) => console.error(err)
    });
  }

  loadWallet() {
    this.workerService.getWallet().subscribe({
      next: (res) => {
        if (res.success) {
          this.wallet = { balance: res.balance, transactions: res.transactions };
          this.cdr.detectChanges();
        }
      },
      error: (err) => console.error(err)
    });
  }

  acceptJob(jobId: string) {
    this.workerService.acceptJob(jobId).subscribe({
      next: (res) => {
        if (res.success) {
          alert('Job Accepted!');
          this.loadJobs();
        }
      },
      error: (err) => {
        console.error(err);
        alert('Failed to accept job.');
      }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
