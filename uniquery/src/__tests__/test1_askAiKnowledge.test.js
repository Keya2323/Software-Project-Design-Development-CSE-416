import { describe, test, expect } from 'vitest';
import { getBotResponse } from '../data/chatKnowledge';

describe('Test 1: Unit Testing — Ask AI Knowledge Engine (getBotResponse)', () => {
  test('TC_01: Returns accurate admission guidelines and official citations for valid university/topic queries', () => {
    // Arrange
    const buetQuery = 'What is the GPA and mark requirement for BUET?';
    const secondTimerQuery = 'Which universities allow second-timer applicants?';
    const medicalQuery = 'Medical (MBBS) admission criteria and Biology GPA';
    const duQuery = 'Dhaka University Unit A marks distribution';
    const ckruetQuery = 'CKRUET cluster (KUET, RUET, CUET) eligibility';
    const gstQuery = 'GST cluster SUST admission details';

    // Act
    const buetResult = getBotResponse(buetQuery);
    const secondTimerResult = getBotResponse(secondTimerQuery);
    const medicalResult = getBotResponse(medicalQuery);
    const duResult = getBotResponse(duQuery);
    const ckruetResult = getBotResponse(ckruetQuery);
    const gstResult = getBotResponse(gstQuery);

    // Assert
    expect(buetResult.universityIds).toEqual(['buet']);
    expect(buetResult.text).toContain('1,305 seats');
    expect(buetResult.officialSource).toContain('ugadmission.buet.ac.bd');

    expect(secondTimerResult.universityIds).toContain('ru');
    expect(secondTimerResult.text).toContain('Rajshahi University (RU)');

    expect(medicalResult.universityIds).toEqual(['medical']);
    expect(medicalResult.text).toContain('5,380');

    expect(duResult.universityIds).toEqual(['du']);
    expect(ckruetResult.universityIds).toEqual(['kuet', 'ruet', 'cuet']);
    expect(gstResult.universityIds).toEqual(['sust']);
  });

  test('TC_02: Applies student profile GPA personalization when profileContextActive is enabled vs disabled', () => {
    // Arrange
    const query = 'Which universities offer CSE for Science students?';
    const studentProfile = {
      sscGpa: 5.00,
      hscGpa: 4.92,
      academicGroup: 'Science'
    };

    // Act
    const personalizedResponse = getBotResponse(query, true, studentProfile);
    const genericResponse = getBotResponse(query, false, studentProfile);

    // Assert
    expect(personalizedResponse.text).toContain('SSC GPA 5');
    expect(personalizedResponse.text).toContain('HSC GPA 4.92');
    expect(personalizedResponse.universityIds).toEqual(['buet', 'du', 'kuet', 'nsu', 'bracu']);

    expect(genericResponse.text).toContain('Leading universities offering Computer Science & Engineering');
    expect(genericResponse.text).not.toContain('4.92');
  });

  test('TC_03: Handles edge-case substring collisions ("undergraduate education" vs "du") and null/empty inputs safely', () => {
    // Arrange
    const tuitionEdgeQuery = 'What are the tuition fees for undergraduate education?';
    const scholarshipEdgeQuery = 'How do scholarships work during graduation?';

    // Act & Assert — Substring collision check ("du" inside "undergraduate"/"education"/"graduation")
    const tuitionResult = getBotResponse(tuitionEdgeQuery);
    expect(tuitionResult.text).toContain('Real Tuition & Cost Overview');
    expect(tuitionResult.universityIds).toEqual(['buet', 'du', 'nsu', 'bracu']);

    const scholarshipResult = getBotResponse(scholarshipEdgeQuery);
    expect(scholarshipResult.text).toContain('100% Tuition Waiver & Scholarship Policies');

    // Act & Assert — Null/empty input safety check
    const emptyResult = getBotResponse(null);
    expect(emptyResult).toBeDefined();
    expect(emptyResult.universityIds.length).toBeGreaterThan(0);
  });
});
