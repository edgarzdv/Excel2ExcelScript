const xlsx = require("xlsx");
const jimalayaWb = xlsx.readFile("jimalaya.xlsx");
const usersWbSheetName = jimalayaWb.SheetNames[0];
const jmUsersData = xlsx.utils.sheet_to_json(
  jimalayaWb.Sheets[usersWbSheetName]
);

const arWb = xlsx.readFile("ar_db.xlsx");
const membershipData = xlsx.utils.sheet_to_json(
  arWb.Sheets[arWb.SheetNames[1]]
);
const arUsersData = xlsx.utils.sheet_to_json(arWb.Sheets[arWb.SheetNames[0]]);

const getColumns = (data) => {
  let columns = "";
  Object.keys(data).forEach((cell, idx) => {
    const commaAfterCell = idx !== Object.keys(data).length - 1 ? "," : "";
    columns += cell + commaAfterCell;
  });
  return columns;
};

const getValues = (data) => {
  let values = "";
  data.forEach((cell, idx) => {
    const commaAfterCell = idx !== data.length - 1 ? "," : "";
    let cellContent = "";
    Object.values(cell).forEach((cellItem, cellIdx) => {
      const commaAfterCell =
        cellIdx !== Object.values(cell).length - 1 ? "," : "";
      cellContent += `'${cellItem}'${commaAfterCell}`;
    });
    values += `(${cellContent})${commaAfterCell}\n`;
  });
  return values;
};

const insertNewUsers = (clubId) => {
  let queryStr = "";

  //   jmUsersData.forEach((jmUser, idx) => {
  const arUsersColumns = getColumns(arUsersData[0]);
  // const newMembership = [
  //   {
  //     id: Object.keys(membershipData[0]).length,
  //     user_id: Object.keys(membershipData[0]).length,
  //     start_date: new Intl.DateTimeFormat("en-US").format(new Date()),
  //     end_date: jmUser.membership_end_date,
  //     membershipName: "yearly",
  //   },
  // ];

  queryStr = `
          BEGIN TRANSACTION
          DECLARE @Counter INT = 0
          DECLARE @TempUsersResult TABLE (
              first_name [VARCHAR] (150),
              last_name [VARCHAR] (150),
              email [VARCHAR] (150),
              phone [VARCHAR] (150),
              membership_start_date [VARCHAR] (150),
              membership_end_date [VARCHAR] (150),
              membership_name [VARCHAR] (150),
              )
          DECLARE @TempMembershipResult TABLE (
            id [VARCHAR] (150),
            user_id [VARCHAR] (150),
            start_date [VARCHAR] (150),
            end_date [VARCHAR] (150),
            membershipName [VARCHAR] (150),
          )

          DECLARE db_cursor CURSOR FOR
          SELECT email
          FROM [jimalaya].[users] 
          
          OPEN db_cursor
          FETCH NEXT FROM db_cursor INTO @TempUsersResult 
          
          
          WHILE @@FETCH_STATUS = 0
          BEGIN
          IF NOT EXISTS 
          (   SELECT 1
              FROM [ar_db].[users] MyUser
              WHERE MyUser.email = '@TempUsersResult.email' 
              )
              BEGIN
              INSERT INTO [ar_db].[Users] (${arUsersColumns})
              VALUES
              @TempUsersResult.first_name,
              @TempUsersResult.last_name,
              @TempUsersResult.phone,
              @TempUsersResult.last_name,
              @TempUsersResult.phone,
              @TempUsersResult.joined_at AS "membership_start_date",
              @TempUsersResult.club_id
              END;
              
              IF EXISTS 
              (   SELECT 1
                  FROM @TempUsersResult
                  )
                  BEGIN
                  SET  @TempMembershipResult.id = ${
                    Object.keys(membershipData[0]).length
                  } + @counter 
                  SET  @TempMembershipResult.user_id = ${
                    Object.keys(membershipData[0]).length
                  } + @counter 
                  SET  @TempMembershipResult.start_date = @TempUsersResult.membership_start_date
                  SET  @TempMembershipResult.start_date = @TempUsersResult.membership_start_date
                  SET  @TempMembershipResult.start_date = @TempUsersResult.membership_name,
                  INSERT INTO [ar_db].[memberships] ${getColumns(
                    membershipData[0]
                  )}
                  VALUES
                  @TempMembershipResult
                  END;
                  SET @counter = @counter + 1
            FETCH NEXT FROM db_cursor INTO @TempUsersResult
            END     `;
  console.log(queryStr);
  //   });
};

insertNewUsers(2400);
