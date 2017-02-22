import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IssueTokensComponent } from './issue-tokens.component';

describe('IssueTokensComponent', () => {
  let component: IssueTokensComponent;
  let fixture: ComponentFixture<IssueTokensComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IssueTokensComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IssueTokensComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
