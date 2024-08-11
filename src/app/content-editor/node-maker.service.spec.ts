import { TestBed } from '@angular/core/testing';

import { NodeMakerService } from './node-maker.service';

describe('NodeMakerService', () => {
  let service: NodeMakerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NodeMakerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
