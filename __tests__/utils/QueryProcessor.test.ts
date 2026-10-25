
import QueryProcessor from "../../utils/QueryProcessor";
import '@testing-library/jest-dom'

describe("QueryProcessor", () => {
    test("should return a string", () => {
        const query = "test";
        const response: string = QueryProcessor(query);
        expect(typeof response).toBe("string");
    });

    test('should return shakespeare description', () => {
        const query = "shakespeare";
        const response: string = QueryProcessor(query);
        expect(response).toBe((
            "William Shakespeare (26 April 1564 - 23 April 1616) was an " +
            "English poet, playwright, and actor, widely regarded as the greatest " +
            "writer in the English language and the world's pre-eminent dramatist."
          ));
    });

    test('should return name', () => {
        const query = "What is your name?";
        const response: string = QueryProcessor(query);
        expect(response).toBe("Eduardo");
    });

    test('should return Andrew ID', () => {
        const query = "What is your Andrew ID?";
        const response: string = QueryProcessor(query);
        expect(response).toBe("hmostafa");
    });

    test.each([
        ["What is 51 plus 14?", "65"],
        ["What is 42 plus 17?", "59"],
        ["What is 38 plus 74?", "112"],
        ["What is 94 plus 42?", "136"],
        ["Calculate 1.5 plus 2.25", "3.75"],
        ["What is 75 plus 71 plus 35?", "181"],
        ["What is 25 minus 12?", "13"],
        ["What is 20 plus 5 minus 8?", "17"],
    ])('should add numbers in "%s"', (query, expected) => {
        expect(QueryProcessor(query)).toBe(expected);
    });

    test('should calculate large integer powers exactly', () => {
        expect(QueryProcessor("What is 14 to the power of 97?")).toBe(
            "1494236912846185452088061826700837191902371265444315864511557082971899640911175229815885685929368287894101295104"
        );
    });

    test.each([
        ["Which of the following numbers is the largest: 4, 78, 14?", "78"],
        ["Which is largest: -4, -14, -2?", "-2"],
        ["Which is largest: 1.5, 2.75, 2?", "2.75"],
    ])('should find the largest number in "%s"', (query, expected) => {
        expect(QueryProcessor(query)).toBe(expected);
    });

    test('should calculate a Scrabble word score', () => {
        expect(QueryProcessor("What is the scrabble score of zoo?")).toBe("12");
    });
});
